"""Listing HTTP client — calls Spring Boot Listing APIs or returns mock data.

Real API Endpoints:
  - Search:  GET  /api/listings/search?maxPrice=&district=&roomType=&tagSlugs=&...
  - Detail:  GET  /api/listings/{id}
  - Save:    POST /api/saved-listings/{listingId}  (needs JWT auth)
  - Reviews: GET  /api/reviews?listingId={id}       (delegated to ReviewClient)
"""

import unicodedata

from app.clients.base_client import BaseClient
from app.clients.mock_data import MOCK_LISTINGS, MOCK_REVIEWS, UNIVERSITY_LOCATIONS


class ListingClient(BaseClient):
    def __init__(self):
        super().__init__("/listings")

    # ── Search ───────────────────────────────────────────────────────

    async def search(self, filters: dict) -> list[dict]:
        """Search listings with filters. Returns mock data when USE_MOCK_CLIENTS=true."""
        if self.use_mock:
            return self._mock_search(filters)

        # Map AI-service filters → BE query params
        params: dict = {}
        if filters.get("district"):
            params["district"] = filters["district"]
        if filters.get("max_price") and filters["max_price"] > 0:
            params["maxPrice"] = filters["max_price"]
        if filters.get("min_price") and filters["min_price"] > 0:
            params["minPrice"] = filters["min_price"]
        if filters.get("room_type"):
            params["roomType"] = filters["room_type"]

        # Convert tag names → slugs for BE (tagSlugs param)
        tags = filters.get("tags", [])
        if tags:
            params["tagSlugs"] = [self._name_to_slug(t) for t in tags]

        # near_university → geo-search using known university coordinates
        near_university = filters.get("near_university")
        if near_university:
            uni_info = self._resolve_university(near_university)
            if uni_info:
                params["latitude"] = uni_info["lat"]
                params["longitude"] = uni_info["lng"]
                params["radiusKm"] = 5.0

        params.setdefault("page", 0)
        params.setdefault("size", 20)

        try:
            response = await self._get("/search", params=params)
            # BE returns PageResponse: {content: [...], page, size, ...}
            items = response.get("content", [])
            return [self._normalize_summary(item) for item in items]
        except Exception as e:
            print(f"⚠️ Listing search API failed, falling back to mock: {e}")
            return self._mock_search(filters)

    # ── Detail ───────────────────────────────────────────────────────

    async def get_detail(self, listing_id: str) -> dict | None:
        if self.use_mock:
            return self._mock_get_detail(listing_id)
        try:
            response = await self._get(f"/{listing_id}")
            return self._normalize_detail(response)
        except Exception as e:
            print(f"⚠️ Listing detail API failed, falling back to mock: {e}")
            return self._mock_get_detail(listing_id)

    # ── Save Favorite ────────────────────────────────────────────────

    async def save_favorite(self, user_id: str, listing_id: str, auth_token: str | None = None) -> dict:
        """Save listing to favorites via internal API.
        Uses POST /api/internal/saved-listings with X-Internal-Key auth.
        """
        if self.use_mock:
            return {"success": True, "message": f"Đã lưu phòng {listing_id} vào danh sách yêu thích."}
        try:
            from app.clients.base_client import InternalClient
            client = InternalClient("/saved-listings")
            result = await client._post_internal("", data={
                "userId": int(user_id),
                "listingId": int(listing_id),
            })
            saved = result.get("saved", True)
            return {
                "success": True,
                "message": result.get("message", "Đã lưu phòng." if saved else "Đã bỏ lưu phòng."),
            }
        except Exception as e:
            return {"success": False, "message": f"Lỗi khi lưu phòng: {e}"}

    # ── Reviews ──────────────────────────────────────────────────────

    async def get_reviews(self, listing_id: str) -> list[dict]:
        if self.use_mock:
            return MOCK_REVIEWS.get(listing_id, [])
        from app.clients.review_client import ReviewClient
        return await ReviewClient().get_reviews(listing_id)

    # ── Normalization: BE camelCase → tool snake_case ─────────────────

    @staticmethod
    def _normalize_summary(item: dict) -> dict:
        """Convert BE ListingSummaryResponse → tool-expected dict."""
        tags = item.get("tags", [])
        return {
            "id": str(item.get("id", "")),
            "title": item.get("title", ""),
            "address": item.get("address", ""),
            "district": item.get("district", ""),
            "city": item.get("city", "Hồ Chí Minh"),
            "room_type": item.get("roomType", ""),
            "area_m2": item.get("areaM2", 0),
            "price_rent": item.get("priceRent", 0),
            "tags": [
                {"id": str(t.get("id", "")), "name": t.get("name", ""), "slug": t.get("slug", "")}
                for t in tags
            ],
            # Fields now available in ListingSummaryResponse
            "avg_rating": item.get("avgRating"),
            "review_count": item.get("reviewCount", 0),
            "is_shared_owner": item.get("isSharedOwner", False),
            "max_occupants": item.get("maxOccupants"),
            "facilities": [],
            "images": [],
            "reviews": [],
            "description": "",
        }

    @staticmethod
    def _normalize_detail(item: dict) -> dict:
        """Convert BE ListingDetailResponse → tool-expected dict."""
        tags = item.get("tags", [])
        facilities = item.get("facilities", [])
        policy = item.get("policy")
        images = item.get("images", [])

        norm_facilities = [
            {
                "id": str(f.get("id", "")),
                "listing_id": str(item.get("id", "")),
                "facility_type": f.get("facilityType", ""),
                "name": f.get("name", ""),
                "is_included": f.get("isIncluded", True),
                "note": f.get("note"),
            }
            for f in facilities
        ]

        norm_policy = None
        if policy:
            norm_policy = {
                "deposit_months": policy.get("depositMonths"),
                "contract_type": policy.get("contractType"),
                "allows_residence_reg": policy.get("allowsResidenceReg", False),
                "checkin_time": str(policy.get("checkinTime", "")) if policy.get("checkinTime") else None,
                "checkout_time": str(policy.get("checkoutTime", "")) if policy.get("checkoutTime") else None,
                "allows_guests": policy.get("allowsGuests", True),
                "allows_pets": policy.get("allowsPets", False),
                "allows_cooking": policy.get("allowsCooking", True),
            }

        norm_images = [
            {
                "id": str(img.get("id", "")),
                "listing_id": str(item.get("id", "")),
                "url": img.get("url", ""),
                "is_cover": img.get("isCover", False),
                "sort_order": img.get("sortOrder", 0),
            }
            for img in images
        ]

        return {
            "id": str(item.get("id", "")),
            "landlord_id": str(item.get("landlordId", "")),
            "title": item.get("title", ""),
            "description": item.get("description", ""),
            "address": item.get("address", ""),
            "district": item.get("district", ""),
            "city": item.get("city", "Hồ Chí Minh"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
            "room_type": item.get("roomType", ""),
            "area_m2": item.get("areaM2", 0),
            "price_rent": item.get("priceRent", 0),
            "price_electricity": item.get("priceElectricity"),
            "price_water": item.get("priceWater"),
            "price_management": item.get("priceManagement"),
            "price_parking": item.get("priceParking"),
            "status": item.get("status", ""),
            "is_shared_owner": item.get("isSharedOwner", False),
            "max_occupants": item.get("maxOccupants"),
            "available_from": str(item.get("availableFrom", "")) if item.get("availableFrom") else None,
            "tags": [
                {"id": str(t.get("id", "")), "name": t.get("name", ""), "slug": t.get("slug", "")}
                for t in tags
            ],
            "facilities": norm_facilities,
            "policies": norm_policy,
            "images": norm_images,
            "reviews": [],
            "avg_rating": None,
            "review_count": 0,
        }

    # ── Helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _name_to_slug(name: str) -> str:
        """Convert Vietnamese tag name to URL-safe slug.
        e.g. 'máy lạnh' → 'may-lanh', 'gác lửng' → 'gac-lung'
        """
        name = name.lower().strip()
        nfkd = unicodedata.normalize('NFKD', name)
        ascii_str = nfkd.encode('ASCII', 'ignore').decode('ASCII')
        slug = ascii_str.replace(' ', '-')
        return slug or name.replace(' ', '-')

    @staticmethod
    def _resolve_university(name: str) -> dict | None:
        """Lookup university lat/lng from known locations."""
        for uni_name, info in UNIVERSITY_LOCATIONS.items():
            if name.lower() in uni_name.lower():
                return info
        return None

    # ── Mock implementations ─────────────────────────────────────────

    def _mock_search(self, filters: dict) -> list[dict]:
        results = list(MOCK_LISTINGS)

        district = filters.get("district")
        if district:
            results = [r for r in results if district.lower() in r["district"].lower()]

        max_price = filters.get("max_price")
        if max_price and max_price > 0:
            results = [r for r in results if r["price_rent"] <= max_price]

        min_price = filters.get("min_price")
        if min_price and min_price > 0:
            results = [r for r in results if r["price_rent"] >= min_price]

        room_type = filters.get("room_type")
        if room_type:
            results = [r for r in results if r["room_type"] == room_type]

        is_shared_owner = filters.get("is_shared_owner")
        if is_shared_owner is not None:
            results = [r for r in results if r["is_shared_owner"] == is_shared_owner]

        tags = filters.get("tags", [])
        if tags:
            for tag in tags:
                tag_lower = tag.lower()
                results = [
                    r for r in results
                    if any(tag_lower in t["name"].lower() for t in r.get("tags", []))
                    or any(tag_lower in f["name"].lower() for f in r.get("facilities", []))
                ]

        near_university = filters.get("near_university")
        if near_university:
            uni_info = self._resolve_university(near_university)
            if uni_info:
                nearby_districts = uni_info["districts"]
                results = [
                    r for r in results
                    if any(d.lower() in r["district"].lower() for d in nearby_districts)
                ]

        return results

    def _mock_get_detail(self, listing_id: str) -> dict | None:
        for listing in MOCK_LISTINGS:
            if listing["id"] == listing_id:
                return listing
        return None
