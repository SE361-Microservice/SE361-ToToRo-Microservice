import apiClient from './apiClient';
import type {
  RoommateProfileRequest,
  RoommateProfileResponse,
  SwipeRequest,
  SwipeResponse,
  RoommateMatchResponse
} from '../types/matching';

export const matchingService = {
  // ── Profiles ────────────────────────────────────────────────────────

  upsertMyProfile: async (request: RoommateProfileRequest): Promise<RoommateProfileResponse> => {
    const response = await apiClient.put<RoommateProfileResponse>('/roommate-profiles/me', request);
    return response.data;
  },

  getMyProfile: async (): Promise<RoommateProfileResponse> => {
    const response = await apiClient.get<RoommateProfileResponse>('/roommate-profiles/me');
    return response.data;
  },

  deleteMyProfile: async (): Promise<void> => {
    await apiClient.delete('/roommate-profiles/me');
  },

  getProfileByUserId: async (userId: number): Promise<RoommateProfileResponse> => {
    const response = await apiClient.get<RoommateProfileResponse>(`/roommate-profiles/user/${userId}`);
    return response.data;
  },

  // ── Swiping & Matches ───────────────────────────────────────────────

  getFeed: async (page = 0, size = 10): Promise<RoommateProfileResponse[]> => {
    const response = await apiClient.get<RoommateProfileResponse[]>(`/matching/feed?page=${page}&size=${size}`);
    return response.data;
  },

  swipe: async (request: SwipeRequest): Promise<SwipeResponse> => {
    const response = await apiClient.post<SwipeResponse>('/matching/swipe', request);
    return response.data;
  },

  getMyMatches: async (): Promise<RoommateMatchResponse[]> => {
    const response = await apiClient.get<RoommateMatchResponse[]>('/matching/matches');
    return response.data;
  },
};

export default matchingService;
