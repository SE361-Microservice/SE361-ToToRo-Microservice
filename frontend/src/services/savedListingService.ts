import apiClient from './apiClient';
import type { PageResponse } from '../types/api';
import type { ListingSummaryResponse } from '../types/listing';

export const savedListingService = {
  /**
   * GET /saved-listings
   * Get user's saved listings (paginated)
   */
  getSavedListings: async (params?: { page?: number; size?: number }): Promise<PageResponse<ListingSummaryResponse>> => {
    const res = await apiClient.get<PageResponse<ListingSummaryResponse>>('/saved-listings', { params });
    return res.data;
  },

  /**
   * POST /saved-listings/:listingId
   * Toggle save status for a listing
   */
  toggleSave: async (listingId: number): Promise<{ saved: boolean; message: string }> => {
    const res = await apiClient.post<{ saved: boolean; message: string }>(`/saved-listings/${listingId}`);
    return res.data;
  },

  /**
   * GET /saved-listings/:listingId/check
   * Check if a listing is saved by current user
   */
  checkSaved: async (listingId: number): Promise<{ saved: boolean }> => {
    const res = await apiClient.get<{ saved: boolean }>(`/saved-listings/${listingId}/check`);
    return res.data;
  }
};

export default savedListingService;
