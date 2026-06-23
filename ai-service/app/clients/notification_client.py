"""Notification HTTP client — creates notifications via internal API.

Real API Endpoint:
  - POST /api/internal/notifications  (service-to-service, X-Internal-Key)
    Body: {userId, type, title, body, refType, refId}
"""

from app.clients.base_client import InternalClient


class NotificationClient(InternalClient):
    def __init__(self):
        super().__init__("/notifications")

    async def send(self, payload: dict) -> dict:
        """Create a notification for a user via internal API."""
        if self.use_mock:
            return {"success": True, "notification_id": f"notif_{payload.get('user_id', 'unknown')}"}
        try:
            result = await self._post_internal("", data={
                "userId": int(payload.get("user_id", 0)),
                "type": payload.get("type", "AI_RECOMMENDATION"),
                "title": payload.get("title", ""),
                "body": payload.get("body", ""),
                "refType": payload.get("ref_type", "LISTING"),
                "refId": int(payload.get("ref_id", 0)) if payload.get("ref_id") else None,
            })
            return {"success": True, "message": result.get("message", "OK")}
        except Exception as e:
            print(f"⚠️ Internal notification API failed: {e}")
            return {"success": False, "message": str(e)}
