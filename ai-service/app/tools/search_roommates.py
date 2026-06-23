"""Tool: search_roommates — Tìm bạn cùng phòng theo lifestyle."""

from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig
from app.clients.matching_client import MatchingClient


@tool
async def search_roommates(
    university: str = "",
    city: str = "",
    ward: str = "",
    budget_min: int = 0,
    budget_max: int = 0,
    sleep_time: str = "",
    gender: str = "",
    ok_with_smoker: bool | None = None,
    ok_with_pets: bool | None = None,
    config: RunnableConfig = None,
) -> str:
    """Tìm bạn cùng phòng (roommate) theo tiêu chí lối sống.

    Args:
        university: Trường đại học (VD: "Bách Khoa", "UEH")
        city: Tỉnh/thành phố ưa thích (VD: "Hồ Chí Minh", "Hà Nội")
        ward: Phường/xã ưa thích
        budget_min: Ngân sách tối thiểu (VNĐ/tháng)
        budget_max: Ngân sách tối đa (VNĐ/tháng)
        sleep_time: Giờ ngủ: "early" (sớm), "normal" (bình thường), "late" (muộn), "very_late" (rất muộn)
        gender: Giới tính mong muốn: "male", "female", "other"
        ok_with_smoker: True nếu chấp nhận bạn phòng hút thuốc
        ok_with_pets: True nếu chấp nhận bạn phòng nuôi thú cưng

    Returns:
        Danh sách bạn cùng phòng phù hợp với thông tin cơ bản.
    """
    user_id = config.get("configurable", {}).get("user_id") if config else None
    client = MatchingClient()
    filters = {}
    if university:
        filters["university"] = university
    if city:
        filters["city"] = city
    if ward:
        filters["ward"] = ward
    if budget_min > 0:
        filters["budget_min"] = budget_min
    if budget_max > 0:
        filters["budget_max"] = budget_max
    if sleep_time:
        filters["sleep_time"] = sleep_time
    if gender:
        filters["gender"] = gender
    if ok_with_smoker is not None:
        filters["ok_with_smoker"] = ok_with_smoker
    if ok_with_pets is not None:
        filters["ok_with_pets"] = ok_with_pets

    results = await client.search(filters)

    # Filter out the current user so they don't see themselves
    if user_id:
        results = [r for r in results if str(r.get("user_id")) != str(user_id)]

    if not results:
        return "Không tìm thấy bạn cùng phòng nào phù hợp. Hãy thử mở rộng tiêu chí."

    output_lines = [f"Tìm thấy {len(results)} bạn cùng phòng phù hợp:\n"]
    for i, r in enumerate(results, 1):
        sleep_map = {"early": "Ngủ sớm", "normal": "Bình thường", "late": "Ngủ muộn", "very_late": "Rất muộn"}
        location = r.get("preferred_city", "")
        if r.get("preferred_ward"):
            location = f"{r['preferred_ward']}, {location}" if location else r["preferred_ward"]
        verified = "✅ Đã xác thực" if r.get("is_verified") else ""
        output_lines.append(
            f"{i}. 👤 **{r['full_name']}**, {r['age']} tuổi {verified}\n"
            f"   🎓 {r.get('university', 'Chưa rõ')}\n"
            f"   💰 {r.get('budget_min', 0):,}đ — {r.get('budget_max', 0):,}đ/tháng\n"
            f"   📍 Thích ở: {location or 'Chưa rõ'}\n"
            f"   🌙 {sleep_map.get(r.get('sleep_time', ''), 'Chưa rõ')}\n"
            f"   📝 {r.get('bio', '')[:80]}\n"
            f"   🆔 ID: {r['id']}\n"
        )
    return "\n".join(output_lines)
