"""Tool: get_compatibility_score — Tính điểm tương thích với bạn phòng."""

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from app.clients.matching_client import MatchingClient
from app.agents.swipe_commentary import compute_compatibility


@tool
async def get_compatibility_score(target_profile_id: str, config: RunnableConfig) -> str:
    """Tính điểm tương thích giữa user hiện tại và một người cụ thể.

    Args:
        target_profile_id: ID profile của người muốn kiểm tra tương thích

    Returns:
        Điểm tương thích và phân tích chi tiết.
    """
    current_user_id = config.get("configurable", {}).get("user_id", "")
    client = MatchingClient()

    current_profile = await client.get_profile_by_user(current_user_id) if current_user_id else None
    target_profile = await client.get_profile(target_profile_id)

    if not target_profile:
        return f"Không tìm thấy profile với ID: {target_profile_id}"

    if not current_profile:
        return (
            f"👤 **{target_profile['full_name']}**, {target_profile['age']} tuổi\n"
            f"🎓 {target_profile.get('university', 'Chưa rõ')}\n"
            f"📝 {target_profile.get('bio', 'Chưa có bio')}\n\n"
            f"⚠️ Bạn chưa tạo profile roommate nên chưa tính được điểm tương thích."
        )

    score, shared_traits = compute_compatibility(current_profile, target_profile)
    traits_str = ", ".join(shared_traits) if shared_traits else "Không có điểm chung nổi bật"

    if score >= 80:
        emoji = "🔥"
        verdict = "Rất hợp nhau!"
    elif score >= 60:
        emoji = "👍"
        verdict = "Khá phù hợp"
    elif score >= 40:
        emoji = "🤔"
        verdict = "Cần trao đổi thêm"
    else:
        emoji = "⚡"
        verdict = "Có nhiều khác biệt"

    return (
        f"{emoji} Điểm tương thích với **{target_profile['full_name']}**: **{score}/100** — {verdict}\n\n"
        f"✅ Điểm chung: {traits_str}\n\n"
        f"👤 {target_profile['full_name']}, {target_profile['age']} tuổi\n"
        f"🎓 {target_profile.get('university', 'Chưa rõ')}\n"
        f"💰 {target_profile.get('budget_min', 0):,}đ — {target_profile.get('budget_max', 0):,}đ/tháng\n"
        f"📝 {target_profile.get('bio', '')}\n"
        f"🆔 ID: {target_profile['id']}"
    )
