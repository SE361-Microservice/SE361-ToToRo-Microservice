"""Listing-related Pydantic models — mirrors frontend types/listing.ts."""

from pydantic import BaseModel


class ListingImage(BaseModel):
    id: str
    listing_id: str
    url: str
    is_cover: bool = False
    sort_order: int = 0


class ListingTag(BaseModel):
    id: str
    name: str
    slug: str


class ListingFacility(BaseModel):
    id: str
    listing_id: str
    facility_type: str  # furniture | appliance | building | amenity
    name: str
    is_included: bool = True
    note: str | None = None


class ListingPolicy(BaseModel):
    id: str
    listing_id: str
    deposit_months: int = 1
    contract_type: str = "monthly"
    allows_residence_reg: bool = False
    checkin_time: str = "06:00"
    checkout_time: str = "23:00"
    allows_guests: bool = True
    allows_pets: bool = False
    allows_cooking: bool = True


class ListingReview(BaseModel):
    id: str
    listing_id: str
    user_id: str
    user_name: str
    user_avatar: str = ""
    rating: int  # 1-5
    comment: str
    created_at: str = ""


class Listing(BaseModel):
    id: str
    landlord_id: str
    title: str
    description: str = ""
    address: str
    district: str
    city: str = "Hồ Chí Minh"
    latitude: float = 0.0
    longitude: float = 0.0
    room_type: str = "single"  # single | shared | apartment | studio
    area_m2: float = 0
    price_rent: int
    price_electricity: int | None = None
    price_water: int | None = None
    price_management: int | None = None
    price_parking: int | None = None
    status: str = "active"
    is_shared_owner: bool = False
    max_occupants: int = 1
    available_from: str | None = None
    avg_rating: float | None = None
    review_count: int | None = None
    images: list[ListingImage] = []
    tags: list[ListingTag] = []
    facilities: list[ListingFacility] = []
    policies: ListingPolicy | None = None
    reviews: list[ListingReview] = []


class ListingSearchFilters(BaseModel):
    district: str | None = None
    max_price: int | None = None
    min_price: int | None = None
    room_type: str | None = None
    tags: list[str] = []
    near_university: str | None = None
    is_shared_owner: bool | None = None
