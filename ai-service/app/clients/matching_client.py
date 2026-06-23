"""Matching HTTP client — roommate search & compatibility.

Real API Endpoints (all public, no auth needed):
  - GET  /api/roommate-profiles/{id}            → get profile by ID
  - GET  /api/roommate-profiles/user/{userId}   → get profile by userId
  - GET  /api/roommate-profiles/search?...      → search profiles with filters
       Params: university, district, budgetMin, budgetMax, sleepTime, gender,
               okWithSmoker, okWithPets, page, size

RoommateProfileResponse fields (BE):
  id, userId, email, headline, bio, preferredCity, budgetMin, budgetMax, isActive,
  fullName, avatar, university, age, gender, preferredDistricts[],
  sleepTime, wakeTime, cleanliness, isSmoker, drinksAlcohol, hasPets, isIntrovert,
  okWithSmoker, okWithPets, createdAt, updatedAt
"""

from app.clients.base_client import BaseClient
from app.clients.mock_data import MOCK_PROFILES


class MatchingClient(BaseClient):
    def __init__(self):
        super().__init__("/roommate-profiles")

    # ── Search ───────────────────────────────────────────────────────

    async def search(self, filters: dict) -> list[dict]:
        """Search roommate profiles with lifestyle filters."""
        if self.use_mock:
            return self._mock_search(filters)

        params: dict = {}
        if filters.get("university"):
            params["university"] = filters["university"]
        if filters.get("district"):
            params["district"] = filters["district"]
        if filters.get("budget_min") and filters["budget_min"] > 0:
            params["budgetMin"] = filters["budget_min"]
        if filters.get("budget_max") and filters["budget_max"] > 0:
            params["budgetMax"] = filters["budget_max"]
        if filters.get("sleep_time"):
            params["sleepTime"] = filters["sleep_time"]
        if filters.get("gender"):
            params["gender"] = filters["gender"]
        if filters.get("ok_with_smoker") is not None:
            params["okWithSmoker"] = filters["ok_with_smoker"]
        if filters.get("ok_with_pets") is not None:
            params["okWithPets"] = filters["ok_with_pets"]
        params["page"] = filters.get("page", 0)
        params["size"] = filters.get("size", 20)

        try:
            response = await self._get("/search", params=params)
            items = response.get("content", [])
            return [self._normalize_profile(p) for p in items]
        except Exception as e:
            print(f"⚠️ Roommate search API failed, falling back to mock: {e}")
            return self._mock_search(filters)

    # ── Get by profile ID ────────────────────────────────────────────

    async def get_profile(self, profile_id: str) -> dict | None:
        if self.use_mock:
            return self._mock_get_profile(profile_id)
        try:
            response = await self._get(f"/{profile_id}")
            return self._normalize_profile(response)
        except Exception as e:
            print(f"⚠️ Roommate profile API failed, falling back to mock: {e}")
            return self._mock_get_profile(profile_id)

    # ── Get by user ID ───────────────────────────────────────────────

    async def get_profile_by_user(self, user_id: str) -> dict | None:
        if self.use_mock:
            for p in MOCK_PROFILES:
                if p["user_id"] == user_id:
                    return p
            return None
        try:
            response = await self._get(f"/user/{user_id}")
            return self._normalize_profile(response)
        except Exception as e:
            print(f"⚠️ Roommate profile by user API failed, falling back to mock: {e}")
            for p in MOCK_PROFILES:
                if p["user_id"] == user_id:
                    return p
            return None

    # ── Normalization: BE camelCase → tool snake_case ─────────────────

    @staticmethod
    def _normalize_profile(p: dict) -> dict:
        """Convert BE RoommateProfileResponse → tool-expected dict."""
        return {
            "id": str(p.get("id") or ""),
            "user_id": str(p.get("userId") or ""),
            "email": p.get("email") or "",
            "full_name": p.get("fullName") or "Ẩn danh",
            "avatar": p.get("avatar") or "",
            "university": p.get("university") or "",
            "age": p.get("age"),
            "gender": p.get("gender") or "",
            "headline": p.get("headline") or "",
            "bio": p.get("bio") or "",
            "preferred_city": p.get("preferredCity") or "",
            "preferred_districts": p.get("preferredDistricts") or [],
            "budget_min": p.get("budgetMin") or 0,
            "budget_max": p.get("budgetMax") or 0,
            "sleep_time": p.get("sleepTime") or "",
            "wake_time": p.get("wakeTime") or "",
            "cleanliness": p.get("cleanliness") or 3,
            "is_smoker": bool(p.get("isSmoker")),
            "drinks_alcohol": bool(p.get("drinksAlcohol")),
            "has_pets": bool(p.get("hasPets")),
            "is_introvert": p.get("isIntrovert"),
            "ok_with_smoker": True if p.get("okWithSmoker") is None else bool(p.get("okWithSmoker")),
            "ok_with_pets": True if p.get("okWithPets") is None else bool(p.get("okWithPets")),
            "is_active": True if p.get("isActive") is None else bool(p.get("isActive")),
        }

    # ── Mock implementations ─────────────────────────────────────────

    def _mock_search(self, filters: dict) -> list[dict]:
        results = list(MOCK_PROFILES)
        university = filters.get("university")
        if university:
            results = [r for r in results if r.get("university") and university.lower() in r["university"].lower()]
        district = filters.get("district")
        if district:
            results = [r for r in results if district in (r.get("preferred_districts") or [])]
        budget_max = filters.get("budget_max")
        if budget_max and budget_max > 0:
            results = [r for r in results if r["budget_min"] <= budget_max]
        budget_min = filters.get("budget_min")
        if budget_min and budget_min > 0:
            results = [r for r in results if r["budget_max"] >= budget_min]
        sleep_time = filters.get("sleep_time")
        if sleep_time:
            results = [r for r in results if r.get("sleep_time") == sleep_time]
        gender = filters.get("gender")
        if gender:
            results = [r for r in results if r.get("gender") == gender]
        ok_with_smoker = filters.get("ok_with_smoker")
        if ok_with_smoker is not None:
            results = [r for r in results if r.get("ok_with_smoker") == ok_with_smoker]
        ok_with_pets = filters.get("ok_with_pets")
        if ok_with_pets is not None:
            results = [r for r in results if r.get("ok_with_pets") == ok_with_pets]
        return results

    def _mock_get_profile(self, profile_id: str) -> dict | None:
        for p in MOCK_PROFILES:
            if p["id"] == profile_id:
                return p
        return None
