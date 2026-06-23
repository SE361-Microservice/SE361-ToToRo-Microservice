"""Tool: initiate_chat — Mở chat với chủ trọ hoặc bạn tiềm năng (WRITE ACTION)."""

from langchain_core.tools import tool
from app.clients.chat_client import ChatClient


@tool
async def initiate_chat(target_id: str, context: str = "", user_id: str = "") -> str:
    """Mở cuộc trò chuyện với chủ trọ hoặc bạn cùng phòng tiềm năng.
    ⚠️ Đây là write action — cần hỏi xác nhận user trước khi thực hiện.

    Args:
        target_id: ID của người muốn chat (chủ trọ hoặc bạn phòng)
        context: Ngữ cảnh cuộc trò chuyện (VD: "Hỏi về phòng Sky Garden")
        user_id: ID user hiện tại (tự động lấy từ context)

    Returns:
        Kết quả mở chat.
    """
    client = ChatClient()
    result = await client.initiate_chat(user_id, target_id, context)
    return result.get("message", "Đã mở cuộc trò chuyện.")
