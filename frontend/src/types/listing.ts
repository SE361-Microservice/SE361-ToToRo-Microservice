// ── Listing Types ─ Mirrors backend DTOs at com.totoro.listing.dto ──

// ── Enums ───────────────────────────────────────────────────────────

export type ListingStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
export type RoomType = 'single' | 'shared' | 'apartment' | 'studio';
export type ContractType = 'monthly' | 'yearly' | 'flexible';
export type FacilityType = 'furniture' | 'appliance' | 'building' | 'amenity';

// ── Tag ─────────────────────────────────────────────────────────────

/** Mirrors: com.totoro.listing.dto.TagDto */
export interface TagDto {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

// ── Image ───────────────────────────────────────────────────────────

/** Mirrors: com.totoro.listing.dto.ImageRequest */
export interface ImageRequest {
  url: string;
  isCover?: boolean;
  sortOrder?: number;
}

/** Mirrors: com.totoro.listing.dto.ImageResponse */
export interface ImageResponse {
  id: number;
  url: string;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}

// ── Facility ────────────────────────────────────────────────────────

/** Mirrors: com.totoro.listing.dto.FacilityRequest */
export interface FacilityRequest {
  facilityType: string;
  name: string;
  isIncluded?: boolean;
  note?: string;
}

/** Mirrors: com.totoro.listing.dto.FacilityResponse */
export interface FacilityResponse {
  id: number;
  facilityType: string;
  name: string;
  isIncluded: boolean;
  note: string | null;
}

// ── Policy ──────────────────────────────────────────────────────────

/** Mirrors: com.totoro.listing.dto.PolicyRequest */
export interface PolicyRequest {
  depositMonths?: number;
  contractType?: string;
  allowsResidenceReg?: boolean;
  checkinTime?: string;   // "HH:mm"
  checkoutTime?: string;  // "HH:mm"
  allowsGuests?: boolean;
  allowsPets?: boolean;
  allowsCooking?: boolean;
  referralPolicy?: string;
  otherRules?: string;
}

/** Mirrors: com.totoro.listing.dto.PolicyResponse */
export interface PolicyResponse {
  id: number;
  depositMonths: number;
  contractType: string;
  allowsResidenceReg: boolean;
  checkinTime: string;    // "HH:mm"
  checkoutTime: string;   // "HH:mm"
  allowsGuests: boolean;
  allowsPets: boolean;
  allowsCooking: boolean;
  referralPolicy: string | null;
  otherRules: string | null;
}

// ── Listing Requests ────────────────────────────────────────────────

/** Mirrors: com.totoro.listing.dto.CreateListingRequest */
export interface CreateListingRequest {
  title: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  roomType: string;
  areaM2?: number;
  priceRent: number;
  priceElectricity?: number;
  priceWater?: number;
  priceManagement?: number;
  priceParking?: number;
  isSharedOwner?: boolean;
  maxOccupants?: number;
  availableFrom?: string; // "YYYY-MM-DD"
  policy?: PolicyRequest;
  facilities?: FacilityRequest[];
  images?: ImageRequest[];
  tagSlugs?: string[];
}

/** Mirrors: com.totoro.listing.dto.UpdateListingRequest */
export interface UpdateListingRequest {
  title?: string;
  description?: string;
  address?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  roomType?: string;
  areaM2?: number;
  priceRent?: number;
  priceElectricity?: number;
  priceWater?: number;
  priceManagement?: number;
  priceParking?: number;
  isSharedOwner?: boolean;
  maxOccupants?: number;
  availableFrom?: string;
  policy?: PolicyRequest;
  facilities?: FacilityRequest[];
  images?: ImageRequest[];
  tagSlugs?: string[];
}

// ── Listing Responses ───────────────────────────────────────────────

/** Mirrors: com.totoro.listing.dto.ListingSummaryResponse */
export interface ListingSummaryResponse {
  id: number;
  title: string;
  address: string;
  city: string;
  ward?: string;
  roomType: string;
  areaM2: number;
  priceRent: number;
  coverImageUrl: string | null;
  tags: TagDto[];
  latitude: number;
  longitude: number;
  status: string;
  rejectionReason?: string;
  viewCount: number;
  distanceKm: number | null;  // populated when searching by distance
  avgRating: number | null;
  reviewCount: number;
  isSharedOwner: boolean;
  maxOccupants: number;
  createdAt: string;
}

/** Mirrors: com.totoro.listing.dto.ListingDetailResponse */
export interface ListingDetailResponse {
  id: number;
  landlordId: number;
  landlordName: string;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  roomType: string;
  areaM2: number;
  priceRent: number;
  priceElectricity: number | null;
  priceWater: number | null;
  priceManagement: number | null;
  priceParking: number | null;
  status: ListingStatus;
  rejectionReason?: string;
  viewCount: number;
  isSharedOwner: boolean;
  maxOccupants: number;
  availableFrom: string | null;
  policy: PolicyResponse | null;
  facilities: FacilityResponse[];
  images: ImageResponse[];
  tags: TagDto[];
  createdAt: string;
  updatedAt: string;
}

// ── Search ──────────────────────────────────────────────────────────

/** Query params for GET /api/listings/search */
export interface ListingSearchParams {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  ward?: string;
  roomType?: string;
  roomTypes?: string[];
  minArea?: number;
  maxArea?: number;
  minRating?: number;
  tagSlugs?: string[];
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// ── Legacy type alias (backward compatibility for existing components) ──

/**
 * @deprecated Use ListingDetailResponse or ListingSummaryResponse instead.
 * Kept temporarily for components that still reference the old Listing type.
 */
export interface Listing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  roomType: RoomType;
  areaM2: number;
  priceRent: number;
  priceElectricity?: number;
  priceWater?: number;
  priceManagement?: number;
  priceParking?: number;
  status: ListingStatus;
  isSharedOwner: boolean;
  maxOccupants: number;
  availableFrom?: string;
  createdAt: string;
  updatedAt: string;
  avgRating?: number;
  reviewCount?: number;
  policies?: ListingPolicy;
  facilities?: ListingFacility[];
  images?: ListingImage[];
  tags?: ListingTag[];
  reviews?: ListingReview[];
}

// Legacy sub-types (for backward compat with mockData/ListingCard/etc.)
export interface ListingTag {
  id: string;
  name: string;
  slug: string;
}
export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}
export interface ListingFacility {
  id: string;
  listingId: string;
  facilityType: FacilityType;
  name: string;
  isIncluded: boolean;
  note?: string;
}
export interface ListingPolicy {
  id: string;
  listingId: string;
  depositMonths: number;
  contractType: ContractType;
  allowsResidenceReg: boolean;
  checkinTime: string;
  checkoutTime: string;
  allowsGuests: boolean;
  allowsPets: boolean;
  allowsCooking: boolean;
  referralPolicy?: string;
  otherRules?: string;
}
export interface ListingReview {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  ratingCleanliness?: number;
  ratingSecurity?: number;
  ratingLandlord?: number;
  ratingAccuracy?: number;
  comment: string;
  upvoteCount?: number;
  createdAt: string;
}
