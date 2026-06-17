import apiClient from './apiClient';
import type { ReportResponse, ResolveReportRequest } from '../types/report';
import type { ListingDetailResponse, ListingSummaryResponse, ListingStatus } from '../types/listing';
import type { UserProfileDto } from '../types/auth';
import type { PageResponse } from '../types/api';

export const adminService = {
  // ── Reports ──────────────────────────────────────────────
  getPendingReports: async (): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ReportResponse[]>('/admin/reports/pending');
    return response.data;
  },

  resolveReport: async (reportId: number, request: ResolveReportRequest): Promise<ReportResponse> => {
    const response = await apiClient.patch<ReportResponse>(`/admin/reports/${reportId}/resolve`, request);
    return response.data;
  },

  // ── Listings ─────────────────────────────────────────────
  activateListing: async (listingId: number): Promise<ListingDetailResponse> => {
    const response = await apiClient.patch<ListingDetailResponse>(`/listings/${listingId}/activate`);
    return response.data;
  },

  rejectListing: async (listingId: number, reason: string): Promise<ListingDetailResponse> => {
    const response = await apiClient.patch<ListingDetailResponse>(`/listings/${listingId}/reject`, { reason });
    return response.data;
  },

  getAllListingsForAdmin: async (status?: ListingStatus, page = 0, size = 20): Promise<PageResponse<ListingSummaryResponse>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get<PageResponse<ListingSummaryResponse>>(`/admin/listings?${params.toString()}`);
    return response.data;
  },

  getListingStats: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>('/admin/listings/stats');
    return response.data;
  },

  // ── Users ────────────────────────────────────────────────
  getAllUsersForAdmin: async (page = 0, size = 20): Promise<PageResponse<UserProfileDto>> => {
    const response = await apiClient.get<PageResponse<UserProfileDto>>(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  changeUserRole: async (userId: number, role: string): Promise<{ message: string; role: string }> => {
    const response = await apiClient.patch<{ message: string; role: string }>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  changeUserBlockStatus: async (userId: number, block: boolean): Promise<{ message: string; isBlocked: boolean }> => {
    const response = await apiClient.patch<{ message: string; isBlocked: boolean }>(`/admin/users/${userId}/block`, { block });
    return response.data;
  }
};

export default adminService;
