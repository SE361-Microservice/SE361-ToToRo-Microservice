import apiClient from './apiClient';
import type { PageResponse } from '../types/api';
import type {
  CreateListingRequest,
  UpdateListingRequest,
  ListingDetailResponse,
  ListingSummaryResponse,
  ListingSearchParams,
} from '../types/listing';

// ── Listing API Service ─────────────────────────────────────────────

const listingService = {
  // ── Search / Browse (Public with auth token) ────────────────────

  /**
   * GET /listings/search
   * Search listings with basic + advanced filters.
   */
  search: async (
    params: ListingSearchParams,
  ): Promise<PageResponse<ListingSummaryResponse>> => {
    // Build query params, filtering out undefined values
    const query: Record<string, string | string[]> = {};
    if (params.minPrice != null) query.minPrice = String(params.minPrice);
    if (params.maxPrice != null) query.maxPrice = String(params.maxPrice);
    if (params.city) query.city = params.city;
    if (params.district) query.district = params.district;
    else if (params.ward) query.district = params.ward;
    if (params.roomType) query.roomType = params.roomType;
    if (params.roomTypes && params.roomTypes.length > 0) query.roomTypes = params.roomTypes;
    if (params.minArea != null) query.minArea = String(params.minArea);
    if (params.maxArea != null) query.maxArea = String(params.maxArea);
    if (params.minRating != null) query.minRating = String(params.minRating);
    if (params.tagSlugs && params.tagSlugs.length > 0) query.tagSlugs = params.tagSlugs;
    if (params.latitude != null) query.latitude = String(params.latitude);
    if (params.longitude != null) query.longitude = String(params.longitude);
    if (params.radiusKm != null) query.radiusKm = String(params.radiusKm);
    if (params.page != null) query.page = String(params.page);
    if (params.size != null) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDir) query.sortDir = params.sortDir;

    const res = await apiClient.get<PageResponse<ListingSummaryResponse>>(
      '/listings/search',
      { params: query },
    );
    return res.data;
  },

  // ── Detail ──────────────────────────────────────────────────────

  /**
   * GET /listings/:id
   * Get listing detail by ID.
   */
  getById: async (id: number): Promise<ListingDetailResponse> => {
    const res = await apiClient.get<ListingDetailResponse>(`/listings/${id}`);
    return res.data;
  },

  /**
   * POST /listings/:id/view
   * Increment view count for a listing.
   */
  incrementViewCount: async (id: number): Promise<void> => {
    await apiClient.post(`/listings/${id}/view`);
  },

  // ── CRUD (Authenticated) ───────────────────────────────────────

  /**
   * POST /listings
   * Create a new listing. Requires LANDLORD or ADMIN role.
   */
  create: async (data: CreateListingRequest): Promise<ListingDetailResponse> => {
    const res = await apiClient.post<ListingDetailResponse>('/listings', data);
    return res.data;
  },

  /**
   * PUT /listings/:id
   * Update an existing listing. Owner only.
   */
  update: async (
    id: number,
    data: UpdateListingRequest,
  ): Promise<ListingDetailResponse> => {
    const res = await apiClient.put<ListingDetailResponse>(
      `/listings/${id}`,
      data,
    );
    return res.data;
  },

  /**
   * DELETE /listings/:id
   * Soft-delete (deactivate) a listing. Owner or ADMIN.
   */
  delete: async (id: number): Promise<string> => {
    const res = await apiClient.delete<string>(`/listings/${id}`);
    return res.data;
  },

  // ── My Listings ────────────────────────────────────────────────

  /**
   * GET /listings/my
   * Get current user's listings (paginated).
   */
  getMyListings: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<ListingSummaryResponse>> => {
    const res = await apiClient.get<PageResponse<ListingSummaryResponse>>(
      '/listings/my',
      { params },
    );
    return res.data;
  },

  // ── Admin Actions ─────────────────────────────────────────────

  /**
   * PATCH /listings/:id/activate
   * Approve a listing. ADMIN only.
   */
  activate: async (id: number): Promise<ListingDetailResponse> => {
    const res = await apiClient.patch<ListingDetailResponse>(
      `/listings/${id}/activate`,
    );
    return res.data;
  },

  /**
   * PATCH /listings/:id/reject
   * Reject a listing. ADMIN only.
   */
  reject: async (id: number): Promise<ListingDetailResponse> => {
    const res = await apiClient.patch<ListingDetailResponse>(
      `/listings/${id}/reject`,
    );
    return res.data;
  },
};

export default listingService;
