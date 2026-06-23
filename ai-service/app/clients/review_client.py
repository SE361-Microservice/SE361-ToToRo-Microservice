"""Review HTTP client — calls Spring Boot Review APIs.

Real API Endpoint:
  - GET /api/reviews?listingId={id}  → List<ReviewResponse>

ReviewResponse fields (BE):
  id, listingId, listingTitle, userId, userFullName, userAvatarUrl,
  ratingOverall, ratingCleanliness, ratingSecurity, ratingLandlord, ratingAccuracy,
  content, upvoteCount, landlordReplyContent, landlordRepliedAt, sources, createdAt, updatedAt
"""

from app.clients.base_client import BaseClient
from app.clients.mock_data import MOCK_REVIEWS


class ReviewClient(BaseClient):
    def __init__(self):
        super().__init__("/reviews")  # Real path: /api/reviews

    async def get_reviews(self, listing_id: str) -> list[dict]:
        if self.use_mock:
            return MOCK_REVIEWS.get(listing_id, [])
        try:
            response = await self._get("", params={"listingId": listing_id})
            # response is List<ReviewResponse>
            return [self._normalize_review(r) for r in response]
        except Exception as e:
            print(f"⚠️ Review API failed, falling back to mock: {e}")
            return MOCK_REVIEWS.get(listing_id, [])

    @staticmethod
    def _normalize_review(r: dict) -> dict:
        """Convert BE ReviewResponse → tool-expected dict (snake_case, flat)."""
        return {
            "id": str(r.get("id", "")),
            "listing_id": str(r.get("listingId", "")),
            "user_id": str(r.get("userId", "")),
            "user_name": r.get("userFullName", "Ẩn danh"),
            "user_avatar": r.get("userAvatarUrl", ""),
            "rating": r.get("ratingOverall", 0),
            "rating_cleanliness": r.get("ratingCleanliness"),
            "rating_security": r.get("ratingSecurity"),
            "rating_landlord": r.get("ratingLandlord"),
            "rating_accuracy": r.get("ratingAccuracy"),
            "comment": r.get("content", ""),
            "upvote_count": r.get("upvoteCount", 0),
            "landlord_reply": r.get("landlordReplyContent"),
            "created_at": str(r.get("createdAt", "")),
        }
