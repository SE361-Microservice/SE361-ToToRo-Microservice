"""Tool: compare_listings — So sánh 2-3 phòng trọ cạnh nhau."""

from langchain_core.tools import tool
from app.clients.listing_client import ListingClient


@tool
async def compare_listings(listing_ids: list[str]) -> str:
    """So sánh 2 đến 3 phòng trọ cạnh nhau để user dễ lựa chọn.

    Args:
        listing_ids: Danh sách ID phòng trọ cần so sánh (tối đa 3)

    Returns:
        Bảng so sánh các phòng trọ theo nhiều tiêu chí.
    """
    if len(listing_ids) < 2:
        return "Cần ít nhất 2 phòng trọ để so sánh."
    if len(listing_ids) > 3:
        listing_ids = listing_ids[:3]

    client = ListingClient()
    listings = []
    for lid in listing_ids:
        detail = await client.get_detail(lid)
        if detail:
            listings.append(detail)

    if len(listings) < 2:
        return "Không tìm đủ phòng trọ để so sánh. Kiểm tra lại ID."

    # Build comparison table
    headers = ["Tiêu chí"] + [f"🏠 {l['title'][:20]}" for l in listings]
    rows = [
        ["💰 Giá thuê"] + [f"{l['price_rent']:,}đ" for l in listings],
        ["📐 Diện tích"] + [f"{l.get('area_m2', '?')}m²" for l in listings],
        ["📍 Quận"] + [l["district"] for l in listings],
        ["🏷️ Loại phòng"] + [l.get("room_type", "?") for l in listings],
        ["👥 Chung chủ"] + ["Có" if l.get("is_shared_owner") else "Không" for l in listings],
        ["👤 Tối đa"] + [f"{l.get('max_occupants', '?')} người" for l in listings],
        ["⭐ Đánh giá"] + [
            f"{l.get('avg_rating', 'N/A')}/5 ({l.get('review_count', 0)})"
            for l in listings
        ],
        ["💡 Điện"] + [f"{l.get('price_electricity', '?')}đ/kWh" for l in listings],
        ["💧 Nước"] + [f"{l.get('price_water', '?')}đ/khối" for l in listings],
        ["🏷️ Tiện ích"] + [
            ", ".join(t["name"] for t in l.get("tags", [])[:3]) or "—"
            for l in listings
        ],
    ]

    # Format as markdown table
    col_widths = [max(len(str(row[i])) for row in [headers] + rows) for i in range(len(headers))]
    separator = "|" + "|".join("-" * (w + 2) for w in col_widths) + "|"

    table_lines = []
    header_line = "|" + "|".join(f" {h:<{col_widths[i]}} " for i, h in enumerate(headers)) + "|"
    table_lines.append(header_line)
    table_lines.append(separator)
    for row in rows:
        line = "|" + "|".join(f" {str(row[i]):<{col_widths[i]}} " for i in range(len(row))) + "|"
        table_lines.append(line)

    return "📊 **So sánh phòng trọ:**\n\n" + "\n".join(table_lines)
