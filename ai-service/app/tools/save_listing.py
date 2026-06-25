"""Tool: save_listing — Lưu phòng vào danh sách yêu thích (WRITE ACTION — requires confirmation)."""

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from app.clients.listing_client import ListingClient


@tool
async def save_listing(listing_id: str, config: RunnableConfig) -> str:
    """Lưu một phòng trọ vào danh sách yêu thích của user.
    ⚠️ Đây là write action — cần hỏi xác nhận user trước khi thực hiện.

    Args:
        listing_id: ID của phòng trọ cần lưu

    Returns:
        Kết quả lưu phòng.
    """
    user_id = config.get("configurable", {}).get("user_id", "")
    if not user_id or user_id == "anonymous":
        return "Vui lòng đăng nhập để lưu phòng vào danh sách yêu thích."
    client = ListingClient()
    result = await client.save_favorite(user_id, listing_id)
    return result.get("message", "Đã lưu phòng thành công.")
