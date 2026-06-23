"""Chat HTTP client — creates conversations via internal API.

Real API Endpoint:
  - POST /api/internal/conversations  (service-to-service, X-Internal-Key)
    Body: {userId: Long, targetUserId: Long}
    Response: ConversationResponse {id, type, name, createdById, memberIds, createdAt}
"""

from app.clients.base_client import InternalClient


class ChatClient(InternalClient):
    def __init__(self):
        super().__init__("/conversations")

    async def initiate_chat(self, user_id: str, target_id: str, context: str = "", auth_token: str | None = None) -> dict:
        """Create a conversation between two users via internal API."""
        if self.use_mock:
            return {
                "success": True,
                "conversation_id": f"conv_{user_id}_{target_id}",
                "message": f"Đã mở cuộc trò chuyện với người dùng {target_id}.",
            }
        try:
            response = await self._post_internal("", data={
                "userId": int(user_id),
                "targetUserId": int(target_id),
            })
            return {
                "success": True,
                "conversation_id": str(response.get("id", "")),
                "message": f"Đã mở cuộc trò chuyện với người dùng {target_id}.",
            }
        except Exception as e:
            return {
                "success": False,
                "conversation_id": "",
                "message": f"Lỗi khi mở chat: {str(e)}",
            }
