"""
Webhook Router — Flow 2: Proactive Notification
When BE activates a listing, it calls POST /agent/notify/new-listing.
AI Service then:
  1. Fetch all active roommate profiles from BE (paged)
  2. Score each profile against the new listing
  3. For users with score >= 60% → generate personalized notification via LLM
  4. Push notifications via POST /api/internal/notifications
"""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import date

from fastapi import APIRouter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from app.config import get_settings
from app.models.notification import NewListingEvent, NotificationPayload
from app.clients.matching_client import MatchingClient
from app.clients.notification_client import NotificationClient
from app.prompts.swipe_system import NOTIFICATION_PROMPT

router = APIRouter()

# ── In-memory rate limiter: max 3 notifications per user per day ────
_daily_counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))


def _can_send(user_id: str, max_per_day: int = 3) -> bool:
    today = date.today().isoformat()
    count = _daily_counts[today].get(user_id, 0)
    return count < max_per_day


def _record_sent(user_id: str) -> None:
    today = date.today().isoformat()
    _daily_counts[today][user_id] = _daily_counts[today].get(user_id, 0) + 1


# ── Listing-to-Profile matching score ────────────────────────────────

def score_listing_for_profile(listing: NewListingEvent, profile: dict) -> tuple[int, list[str]]:
    """Compute how well a new listing matches a user's roommate profile preferences.

    Factors & Weights:
    - Budget fit:      30%  (listing price within user's budget range)
    - District match:  25%  (listing district in user's preferred districts)
    - Room type:       15%  (if user has preference)
    - Shared owner:    10%  (matching preference)
    - Tags overlap:    20%  (listing tags vs user's interests)

    Returns: (score 0-100, list of matched criteria labels)
    """
    total = 0.0
    matched: list[str] = []

    # 1. Budget fit (30%)
    user_max = profile.get("budget_max", 0)
    user_min = profile.get("budget_min", 0)
    price = listing.price
    if user_max > 0 and price > 0:
        if user_min <= price <= user_max:
            total += 30
            matched.append(f"Giá {price:,}đ nằm trong budget")
        elif price < user_min:
            total += 25  # cheaper is usually ok
            matched.append(f"Giá rẻ hơn budget ({price:,}đ)")
        elif price <= user_max * 1.1:
            total += 15  # slightly over
        # else: 0

    # 2. District match (25%)
    user_districts = set(d.lower().strip() for d in (profile.get("preferred_districts") or []))
    if user_districts and listing.district:
        if listing.district.lower().strip() in user_districts:
            total += 25
            matched.append(f"Quận {listing.district}")
    elif not user_districts:
        total += 12  # neutral

    # 3. Room type (15%)
    user_city = profile.get("preferred_city", "")
    if user_city and listing.city:
        if user_city.lower() in listing.city.lower() or listing.city.lower() in user_city.lower():
            total += 15
            matched.append(f"Thành phố {listing.city}")
    else:
        total += 7  # neutral

    # 4. Shared owner preference (10%)
    if listing.is_shared_owner:
        total += 10
        matched.append("Chung chủ")
    else:
        total += 5  # neutral

    # 5. Tags overlap (20%)
    listing_tags = set(t.lower() for t in (listing.tags or []))
    if listing_tags:
        # Award partial credit based on any overlap with common desirable tags
        total += 10  # base credit for having tags
        if any(t in listing_tags for t in ["wifi", "may-lanh", "noi-that", "gac-lung", "ban-cong"]):
            total += 10
            matched.append("Tiện ích phù hợp")
    else:
        total += 10  # neutral

    return min(round(total), 100), matched


# ── LLM notification text generation ─────────────────────────────────

async def _generate_notification_text(
    listing: NewListingEvent,
    profile: dict,
    score: int,
    matched_criteria: list[str],
) -> tuple[str, str]:
    """Generate personalized notification title & body via LLM.
    Returns: (title, body)
    """
    settings = get_settings()

    prompt_text = NOTIFICATION_PROMPT.format(
        listing_title=listing.title,
        listing_price=listing.price,
        listing_district=listing.district,
        listing_tags=", ".join(listing.tags) if listing.tags else "N/A",
        is_shared_owner="Có" if listing.is_shared_owner else "Không",
        area_m2=listing.area_m2,
        user_max_price=profile.get("budget_max", 0),
        user_districts=", ".join(profile.get("preferred_districts") or []) or "Chưa rõ",
        user_tags="N/A",
        user_university=profile.get("university", "Chưa rõ"),
        score=score,
        matched=len(matched_criteria),
        total=5,
        matched_criteria=", ".join(matched_criteria) if matched_criteria else "Không xác định",
    )

    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.7,
        )
        response = await llm.ainvoke([HumanMessage(content=prompt_text)])
        text = response.content.strip()

        # Parse JSON from LLM response
        # Try to extract JSON if wrapped in markdown code block
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        parsed = json.loads(text)
        return parsed.get("title", "Phòng mới phù hợp!"), parsed.get("body", f"{listing.title}")
    except Exception as e:
        print(f"⚠️ LLM notification generation failed: {e}")
        # Fallback
        return (
            f"🏠 Phòng mới tại {listing.district}!",
            f"{listing.title} — {listing.price:,}đ/tháng. Phù hợp {score}% với bạn!",
        )


# ── Webhook Endpoint ─────────────────────────────────────────────────

@router.post("/notify/new-listing")
async def on_new_listing(event: NewListingEvent):
    """Webhook called by Spring Boot when a listing is activated.

    Flow:
    1. Fetch all active roommate profiles (paginated)
    2. Score each profile against the new listing
    3. For users with score >= 60%: generate LLM notification + push
    4. Guardrail: max 3 notifications per user per day
    """
    settings = get_settings()
    matching_client = MatchingClient()
    notification_client = NotificationClient()

    # Fetch active profiles (page through all)
    all_profiles: list[dict] = []
    page = 0
    while True:
        try:
            profiles_page = await matching_client.search({
                "page": page,
                "size": 50,
            })
            if not profiles_page:
                break
            all_profiles.extend(profiles_page)
            if len(profiles_page) < 50:
                break
            page += 1
        except Exception as e:
            print(f"⚠️ Failed to fetch profiles page {page}: {e}")
            break

    if not all_profiles:
        return {
            "status": "ok",
            "listing_id": event.listing_id,
            "message": "No active profiles found",
            "scored": 0,
            "qualified": 0,
            "sent": 0,
        }

    # Score each profile
    qualified: list[tuple[dict, int, list[str]]] = []
    for profile in all_profiles:
        # Skip the landlord
        if str(profile.get("user_id", "")) == event.landlord_id:
            continue

        score, matched_criteria = score_listing_for_profile(event, profile)
        if score >= 60:
            qualified.append((profile, score, matched_criteria))

    # Sort by score descending
    qualified.sort(key=lambda x: x[1], reverse=True)

    # Send notifications (with rate limiting)
    sent = 0
    skipped_rate_limit = 0

    for profile, score, matched_criteria in qualified:
        user_id = str(profile.get("user_id", ""))
        if not user_id:
            continue

        if not _can_send(user_id):
            skipped_rate_limit += 1
            continue

        # Generate personalized notification text
        title, body = await _generate_notification_text(event, profile, score, matched_criteria)

        # Push notification via internal API
        result = await notification_client.send({
            "user_id": user_id,
            "type": "NEW_LISTING_MATCH",
            "title": title,
            "body": body,
            "ref_type": "LISTING",
            "ref_id": event.listing_id,
        })

        if result.get("success"):
            _record_sent(user_id)
            sent += 1

    return {
        "status": "ok",
        "listing_id": event.listing_id,
        "total_profiles": len(all_profiles),
        "qualified": len(qualified),
        "sent": sent,
        "skipped_rate_limit": skipped_rate_limit,
    }
