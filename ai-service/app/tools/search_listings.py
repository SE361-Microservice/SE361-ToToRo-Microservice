"""Tool: search_listings — Tìm phòng trọ theo tiêu chí."""

from langchain_core.tools import tool
from app.clients.listing_client import ListingClient


@tool
async def search_listings(
    district: str = "",
    max_price: int = 0,
    min_price: int = 0,
    room_type: str = "",
    tags: list[str] = [],
    near_university: str = "",
    is_shared_owner: bool | None = None,
) -> str:
    """Tìm phòng trọ theo nhiều tiêu chí lọc.

    Args:
        district: Quận/huyện (VD: "Quận 7", "Thủ Đức", "Bình Thạnh", "Quận 10")
        max_price: Giá thuê tối đa (VNĐ/tháng). VD: 3000000 cho 3 triệu
        min_price: Giá thuê tối thiểu (VNĐ/tháng)
        room_type: Loại phòng: "single" (phòng trọ), "shared" (ở ghép), "apartment" (căn hộ), "studio"
        tags: Danh sách tiện ích yêu cầu: ["máy lạnh", "wifi", "gác lửng", "ban công", "nội thất"]
        near_university: Tên trường đại học gần đó (VD: "Bách Khoa", "UEH", "RMIT")
        is_shared_owner: True nếu chấp nhận chung chủ, False nếu KHÔNG muốn chung chủ, bỏ trống nếu không quan tâm

    Returns:
        Danh sách phòng trọ phù hợp, mỗi phòng bao gồm tên, giá, địa chỉ, đánh giá, tiện ích.
    """
    client = ListingClient()
    filters = {}
    if district:
        filters["district"] = district
    if max_price > 0:
        filters["max_price"] = max_price
    if min_price > 0:
        filters["min_price"] = min_price
    if room_type:
        filters["room_type"] = room_type
    if tags:
        filters["tags"] = tags
    if near_university:
        filters["near_university"] = near_university
    if is_shared_owner is not None:
        filters["is_shared_owner"] = is_shared_owner

    results = await client.search(filters)

    if not results:
        return "Không tìm thấy phòng trọ nào phù hợp với tiêu chí tìm kiếm. Hãy thử mở rộng phạm vi tìm kiếm."

    output_lines = [f"Tìm thấy {len(results)} phòng trọ phù hợp:\n"]
    for i, r in enumerate(results, 1):
        tag_names = ", ".join(t["name"] for t in r.get("tags", []))
        rating_str = f"⭐ {r.get('avg_rating', 'N/A')}/5 ({r.get('review_count', 0)} reviews)" if r.get("avg_rating") else "Chưa có đánh giá"
        shared = "Chung chủ" if r.get("is_shared_owner") else "Không chung chủ"
        output_lines.append(
            f"{i}. 🏠 **{r['title']}** — {r['price_rent']:,}đ/tháng\n"
            f"   📍 {r['address']}, {r['district']}\n"
            f"   📐 {r.get('area_m2', '?')}m² · {r.get('room_type', '')} · {shared}\n"
            f"   {rating_str}\n"
            f"   🏷️ {tag_names or 'Không có tag'}\n"
            f"   🆔 ID: {r['id']}\n"
        )
    return "\n".join(output_lines)
