"""Notification-related Pydantic models."""

from pydantic import BaseModel


class NewListingEvent(BaseModel):
    """Webhook payload from Spring Boot when a new listing is created."""
    listing_id: str
    title: str
    price: int
    district: str
    city: str = "Hồ Chí Minh"
    tags: list[str] = []
    landlord_id: str
    address: str = ""
    room_type: str = ""
    is_shared_owner: bool = False
    area_m2: float = 0


class UserPreferences(BaseModel):
    """User's saved search preferences for proactive matching."""
    user_id: str
    max_price: int | None = None
    preferred_districts: list[str] = []
    required_tags: list[str] = []
    preferred_room_type: str | None = None
    near_university: str | None = None
    is_shared_owner: bool | None = None


class NotificationPayload(BaseModel):
    """Notification to be sent to a user via Notification Service."""
    user_id: str
    type: str = "NEW_LISTING_MATCH"
    title: str
    body: str
    ref_type: str = "listing"
    ref_id: str
    match_score: float = 0.0
    matched_criteria: list[str] = []
