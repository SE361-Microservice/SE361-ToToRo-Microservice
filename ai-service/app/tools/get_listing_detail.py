"""Tool: get_listing_detail — Xem chi tiết một phòng trọ."""

from langchain_core.tools import tool
from app.clients.listing_client import ListingClient


@tool
async def get_listing_detail(listing_id: str) -> str:
    """Lấy thông tin chi tiết của một phòng trọ cụ thể bằng ID.

    Args:
        listing_id: ID của phòng trọ cần xem chi tiết

    Returns:
        Thông tin chi tiết phòng trọ bao gồm mô tả, tiện ích, chính sách, giá điện nước.
    """
    client = ListingClient()
    listing = await client.get_detail(listing_id)

    if not listing:
        return f"Không tìm thấy phòng trọ với ID: {listing_id}"

    # Format detailed output
    facilities_str = "\n".join(
        f"  {'✅' if f['is_included'] else '❌'} {f['name']}"
        for f in listing.get("facilities", [])
    ) or "  Chưa có thông tin"

    tags_str = ", ".join(t["name"] for t in listing.get("tags", [])) or "Không có"

    policy = listing.get("policies")
    policy_str = "Chưa có thông tin"
    if policy:
        policy_str = (
            f"  • Đặt cọc: {policy.get('deposit_months', '?')} tháng\n"
            f"  • Hợp đồng: {policy.get('contract_type', '?')}\n"
            f"  • Giờ vào: {policy.get('checkin_time', '?')} — Giờ ra: {policy.get('checkout_time', '?')}\n"
            f"  • Khách: {'✅' if policy.get('allows_guests') else '❌'} · "
            f"Thú cưng: {'✅' if policy.get('allows_pets') else '❌'} · "
            f"Nấu ăn: {'✅' if policy.get('allows_cooking') else '❌'}"
        )

    shared = "Chung chủ" if listing.get("is_shared_owner") else "Không chung chủ"

    return (
        f"🏠 **{listing['title']}**\n"
        f"📍 {listing['address']}, {listing['district']}, {listing.get('city', '')}\n"
        f"💰 {listing['price_rent']:,}đ/tháng\n"
        f"📐 {listing.get('area_m2', '?')}m² · {listing.get('room_type', '')} · {shared}\n"
        f"👥 Tối đa {listing.get('max_occupants', '?')} người\n"
        f"⭐ {listing.get('avg_rating', 'N/A')}/5 ({listing.get('review_count', 0)} reviews)\n\n"
        f"📝 Mô tả:\n{listing.get('description', 'Không có mô tả')}\n\n"
        f"💡 Chi phí thêm:\n"
        f"  • Điện: {listing.get('price_electricity', '?')}đ/kWh\n"
        f"  • Nước: {listing.get('price_water', '?')}đ/khối\n"
        f"  • Giữ xe: {listing.get('price_parking', 'miễn phí')}đ/tháng\n\n"
        f"🏗️ Tiện ích:\n{facilities_str}\n\n"
        f"🏷️ Tags: {tags_str}\n\n"
        f"📋 Chính sách:\n{policy_str}\n\n"
        f"🆔 ID: {listing['id']}"
    )
