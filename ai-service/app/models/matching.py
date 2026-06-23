"""Roommate matching Pydantic models — mirrors frontend types/matching.ts."""

from pydantic import BaseModel


class RoommateProfile(BaseModel):
    id: str
    user_id: str
    full_name: str
    age: int
    avatar: str = ""
    gender: str | None = None  # male | female | other
    university: str | None = None
    budget_min: int = 0
    budget_max: int = 0
    preferred_city: str = ""
    preferred_ward: str = ""
    sleep_time: str | None = None  # early | normal | late | very_late
    wake_time: str | None = None  # early | normal | late
    cleanliness: int = 3  # 1-5
    is_smoker: bool = False
    drinks_alcohol: bool = False
    has_pets: bool = False
    is_introvert: bool | None = None
    ok_with_smoker: bool = False
    ok_with_pets: bool = False
    bio: str | None = None
    is_verified: bool = False
    is_active: bool = True
    compatibility_score: int | None = None  # 0-100
    location: str | None = None


class RoommateSearchFilters(BaseModel):
    university: str | None = None
    city: str | None = None
    ward: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    sleep_time: str | None = None
    ok_with_smoker: bool | None = None
    ok_with_pets: bool | None = None
    gender: str | None = None

