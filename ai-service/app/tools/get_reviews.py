"""Tool: get_reviews — Lấy reviews của một phòng trọ."""

from langchain_core.tools import tool
from app.clients.review_client import ReviewClient


@tool
async def get_reviews(listing_id: str) -> str:
    """Lấy danh sách đánh giá (reviews) của một phòng trọ.

    Args:
        listing_id: ID của phòng trọ cần xem reviews

    Returns:
        Danh sách reviews bao gồm rating, tên người đánh giá, và nội dung.
    """
    client = ReviewClient()
    reviews = await client.get_reviews(listing_id)

    if not reviews:
        return f"Phòng trọ ID {listing_id} chưa có đánh giá nào."

    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    output_lines = [
        f"📊 Phòng trọ ID {listing_id} — {len(reviews)} đánh giá · Trung bình: ⭐ {avg_rating:.1f}/5\n"
    ]
    for r in reviews:
        stars = "⭐" * r["rating"]
        output_lines.append(
            f"  {stars} — **{r['user_name']}**\n"
            f"  \"{r['comment']}\"\n"
        )
    return "\n".join(output_lines)
