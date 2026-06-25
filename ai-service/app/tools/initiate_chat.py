"""Tool: initiate_chat — Mở chat với chủ trọ hoặc bạn tiềm năng (WRITE ACTION)."""

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from app.clients.chat_client import ChatClient


@tool
async def initiate_chat(target_id: str, config: RunnableConfig, context: str = "") -> str:
    """Mở cuộc trò chuyện với chủ trọ hoặc bạn cùng phòng tiềm năng.
    ⚠️ Đây là write action — cần hỏi xác nhận user trước khi thực hiện.

    Args:
        target_id: ID của người muốn chat (chủ trọ hoặc bạn phòng)
        context: Ngữ cảnh cuộc trò chuyện (VD: "Hỏi về phòng Sky Garden")

    Returns:
        Kết quả mở chat.
    """
    user_id = config.get("configurable", {}).get("user_id", "")
    if not user_id or user_id == "anonymous":
        return "Vui lòng đăng nhập để mở cuộc trò chuyện."
    client = ChatClient()
    result = await client.initiate_chat(user_id, target_id, context)
    return result.get("message", "Đã mở cuộc trò chuyện.")
