"""Chat / Agent conversation Pydantic models."""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Request body for POST /agent/chat."""
    message: str
    thread_id: str                    # Conversation session ID
    user_id: str
    confirm_action: bool | None = None  # User's confirmation for pending write action


class SearchResultItem(BaseModel):
    """A single listing/roommate result for FE rendering."""
    id: str
    type: str = "listing"  # "listing" | "roommate"
    title: str
    subtitle: str = ""
    price: int | None = None
    district: str | None = None
    rating: float | None = None
    tags: list[str] = []
    image_url: str | None = None
    compatibility_score: int | None = None


class PendingAction(BaseModel):
    """Action waiting for user confirmation."""
    action_type: str  # "save_listing" | "initiate_chat"
    target_id: str
    description: str


class ChatResponse(BaseModel):
    """Response body for POST /agent/chat."""
    reply: str
    requires_confirmation: bool = False
    pending_action: PendingAction | None = None
    search_results: list[SearchResultItem] = []


class CompatibilityRequest(BaseModel):
    """Query params for GET /agent/compatibility."""
    current_user_id: str
    target_profile_id: str


class CompatibilityResponse(BaseModel):
    """Response body for GET /agent/compatibility."""
    score: int                      # 0-100
    commentary: str                 # AI-generated text
    shared_traits: list[str] = []
    recommendation: str = "consider"  # strong_match | good_match | consider | low_match
