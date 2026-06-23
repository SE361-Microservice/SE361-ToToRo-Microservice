"""
Flow 3: Swipe AI Commentary
Deterministic compatibility scoring + LLM-generated natural language commentary.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from app.config import get_settings
from app.models.chat import CompatibilityResponse
from app.prompts.swipe_system import SWIPE_COMMENTARY_PROMPT


# ── Write actions that require user confirmation ─────────────────────
WRITE_ACTION_TOOLS = {"save_listing", "initiate_chat"}


# ── Deterministic Compatibility Scoring ──────────────────────────────

def compute_compatibility(user: dict, target: dict) -> tuple[int, list[str]]:
    """Rule-based compatibility scoring between two roommate profiles.

    Factors & Weights:
    - Budget overlap:         20%
    - District match:         15%
    - Sleep schedule:         15%
    - Cleanliness gap:        15%
    - Smoking compatibility:  10%
    - Pet compatibility:      10%
    - Personality match:      10%
    - University proximity:    5%

    Returns:
        (score 0-100, list of shared trait labels)
    """
    total_score = 0.0
    shared_traits: list[str] = []

    # 1. Budget overlap (20%)
    u_min, u_max = user.get("budget_min", 0), user.get("budget_max", 0)
    t_min, t_max = target.get("budget_min", 0), target.get("budget_max", 0)
    if u_max > 0 and t_max > 0:
        overlap_start = max(u_min, t_min)
        overlap_end = min(u_max, t_max)
        if overlap_end >= overlap_start:
            overlap_range = overlap_end - overlap_start
            total_range = max(u_max, t_max) - min(u_min, t_min)
            budget_score = (overlap_range / total_range) if total_range > 0 else 0
            total_score += budget_score * 20
            if budget_score > 0.5:
                shared_traits.append("Budget tương đồng")
    else:
        total_score += 10  # neutral if no data

    # 2. District match (15%)
    u_districts = set(user.get("preferred_districts") or [])
    t_districts = set(target.get("preferred_districts") or [])
    if u_districts and t_districts:
        common = u_districts & t_districts
        if common:
            district_score = len(common) / max(len(u_districts), len(t_districts))
            total_score += district_score * 15
            shared_traits.append(f"Cùng khu {list(common)[0]}")
        # else: 0 points
    else:
        total_score += 7.5  # neutral

    # 3. Sleep schedule (15%)
    sleep_order = {"early": 0, "normal": 1, "late": 2, "very_late": 3}
    u_sleep = sleep_order.get(user.get("sleep_time", ""), 1)
    t_sleep = sleep_order.get(target.get("sleep_time", ""), 1)
    sleep_diff = abs(u_sleep - t_sleep)
    sleep_score = max(0, 1 - sleep_diff * 0.33)
    total_score += sleep_score * 15
    if sleep_diff == 0:
        sleep_labels = {"early": "Ngủ sớm", "normal": "Giờ ngủ bình thường", "late": "Cú đêm", "very_late": "Thức rất khuya"}
        shared_traits.append(sleep_labels.get(user.get("sleep_time", ""), "Giờ ngủ giống nhau"))

    # 4. Cleanliness gap (15%)
    u_clean = user.get("cleanliness", 3)
    t_clean = target.get("cleanliness", 3)
    clean_diff = abs(u_clean - t_clean)
    clean_score = max(0, 1 - clean_diff * 0.25)
    total_score += clean_score * 15
    if clean_diff <= 1:
        shared_traits.append("Mức sạch sẽ tương đương")

    # 5. Smoking compatibility (10%)
    u_smoker = user.get("is_smoker", False)
    t_smoker = target.get("is_smoker", False)
    u_ok_smoke = user.get("ok_with_smoker", False)
    t_ok_smoke = target.get("ok_with_smoker", False)
    if not u_smoker and not t_smoker:
        total_score += 10
        shared_traits.append("Đều không hút thuốc")
    elif u_smoker and t_ok_smoke and t_smoker and u_ok_smoke:
        total_score += 8
    elif (u_smoker and not t_ok_smoke) or (t_smoker and not u_ok_smoke):
        total_score += 0  # dealbreaker
    else:
        total_score += 5

    # 6. Pet compatibility (10%)
    u_pets = user.get("has_pets", False)
    t_pets = target.get("has_pets", False)
    u_ok_pets = user.get("ok_with_pets", False)
    t_ok_pets = target.get("ok_with_pets", False)
    if u_pets == t_pets:
        total_score += 10
        if u_pets:
            shared_traits.append("Đều yêu thú cưng")
    elif (u_pets and t_ok_pets) or (t_pets and u_ok_pets):
        total_score += 7
    else:
        total_score += 2

    # 7. Personality match (10%)
    u_intro = user.get("is_introvert")
    t_intro = target.get("is_introvert")
    if u_intro is not None and t_intro is not None:
        if u_intro == t_intro:
            total_score += 10
            shared_traits.append("Hướng nội" if u_intro else "Hướng ngoại")
        else:
            total_score += 5  # different but not dealbreaker
    else:
        total_score += 5  # neutral

    # 8. University proximity (5%)
    u_uni = user.get("university", "")
    t_uni = target.get("university", "")
    if u_uni and t_uni:
        if u_uni == t_uni:
            total_score += 5
            shared_traits.append(f"Cùng trường {u_uni.split()[-1]}")
        else:
            total_score += 2
    else:
        total_score += 2.5

    return round(total_score), shared_traits


def classify_match(score: int) -> str:
    """Classify match quality based on score."""
    if score >= 80:
        return "strong_match"
    elif score >= 60:
        return "good_match"
    elif score >= 40:
        return "consider"
    else:
        return "low_match"


# ── LLM Commentary Generation ───────────────────────────────────────

def _get_llm() -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.7,
    )


def _bool_vn(val: bool | None) -> str:
    if val is None:
        return "Chưa rõ"
    return "Có" if val else "Không"


def _sleep_vn(val: str | None) -> str:
    mapping = {"early": "Sớm", "normal": "Bình thường", "late": "Muộn", "very_late": "Rất muộn"}
    return mapping.get(val or "", "Chưa rõ")


async def generate_compatibility_commentary(
    current_user: dict,
    target_profile: dict,
) -> CompatibilityResponse:
    """Generate AI commentary for roommate swipe card.

    1. Rule-based scoring (deterministic, fast)
    2. LLM commentary (creative, natural language)
    """
    # Step 1: Deterministic scoring
    score, shared_traits = compute_compatibility(current_user, target_profile)

    # Step 2: LLM commentary
    llm = _get_llm()
    prompt_text = SWIPE_COMMENTARY_PROMPT.format(
        current_name=current_user.get("full_name") or "Bạn",
        current_age=current_user.get("age") or "?",
        current_university=current_user.get("university") or "Chưa rõ",
        current_budget_min=current_user.get("budget_min") or 0,
        current_budget_max=current_user.get("budget_max") or 0,
        current_sleep=_sleep_vn(current_user.get("sleep_time")),
        current_wake=_sleep_vn(current_user.get("wake_time")),
        current_cleanliness=current_user.get("cleanliness") or 3,
        current_smoker=_bool_vn(current_user.get("is_smoker")),
        current_alcohol=_bool_vn(current_user.get("drinks_alcohol")),
        current_pets=_bool_vn(current_user.get("has_pets")),
        current_introvert=_bool_vn(current_user.get("is_introvert")),
        current_bio=current_user.get("bio") or "Chưa có",
        target_name=target_profile.get("full_name") or "?",
        target_age=target_profile.get("age") or "?",
        target_university=target_profile.get("university") or "Chưa rõ",
        target_budget_min=target_profile.get("budget_min") or 0,
        target_budget_max=target_profile.get("budget_max") or 0,
        target_sleep=_sleep_vn(target_profile.get("sleep_time")),
        target_wake=_sleep_vn(target_profile.get("wake_time")),
        target_cleanliness=target_profile.get("cleanliness") or 3,
        target_smoker=_bool_vn(target_profile.get("is_smoker")),
        target_alcohol=_bool_vn(target_profile.get("drinks_alcohol")),
        target_pets=_bool_vn(target_profile.get("has_pets")),
        target_introvert=_bool_vn(target_profile.get("is_introvert")),
        target_bio=target_profile.get("bio") or "Chưa có",
        score=score,
        shared_traits=", ".join(shared_traits) if shared_traits else "Chưa phát hiện điểm chung nổi bật",
    )

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt_text)])
        commentary = response.content.strip()
    except Exception as e:
        # Fallback to deterministic commentary if LLM fails
        commentary = _fallback_commentary(score, shared_traits, target_profile)

    return CompatibilityResponse(
        score=score,
        commentary=commentary,
        shared_traits=shared_traits,
        recommendation=classify_match(score),
    )


def _fallback_commentary(score: int, shared_traits: list[str], target: dict) -> str:
    """Fallback commentary when LLM is unavailable."""
    name = target.get("full_name", "người này")
    if score >= 80:
        traits = " và ".join(shared_traits[:2]) if shared_traits else "nhiều thứ"
        return f"Bạn và {name} rất hợp nhau! 🔥 Cùng {traits}."
    elif score >= 60:
        trait = shared_traits[0] if shared_traits else "một số thứ"
        return f"Bạn và {name} khá phù hợp 👍 — {trait}. Nên trao đổi thêm!"
    elif score >= 40:
        return f"Bạn và {name} có một số điểm khác biệt 🤔 Hãy tìm hiểu thêm trước khi quyết định."
    else:
        return f"Bạn và {name} có lối sống khá khác nhau. Cân nhắc kỹ trước khi ghép phòng nhé!"
