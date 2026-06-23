"""Tool: save_listing — Lưu phòng vào danh sách yêu thích (WRITE ACTION — requires confirmation)."""

from langchain_core.tools import tool
from app.clients.listing_client import ListingClient


@tool
async def save_listing(listing_id: str, user_id: str = "") -> str:
    """Lưu một phòng trọ vào danh sách yêu thích của user.
    ⚠️ Đây là write action — cần hỏi xác nhận user trước khi thực hiện.

    Args:
        listing_id: ID của phòng trọ cần lưu
        user_id: ID của user (tự động lấy từ context)

    Returns:
        Kết quả lưu phòng.
    """
    client = ListingClient()
    result = await client.save_favorite(user_id, listing_id)
    return result.get("message", "Đã lưu phòng thành công.")
