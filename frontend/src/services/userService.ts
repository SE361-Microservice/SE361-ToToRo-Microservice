import apiClient from './apiClient';
import type {
  UserProfileDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateProfileRequest,
} from '../types/auth';

// ── User API Service ────────────────────────────────────────────────

const userService = {
  /**
   * GET /users/me
   * Requires Bearer token (auto-attached by apiClient interceptor)
   */
  getCurrentUser: async (): Promise<UserProfileDto> => {
    const res = await apiClient.get<UserProfileDto>('/users/me');
    return res.data;
  },

  /**
   * GET /users/{id}
   * Get public profile of a user.
   */
  getUserProfile: async (id: number): Promise<UserProfileDto> => {
    const res = await apiClient.get<UserProfileDto>(`/users/${id}`);
    return res.data;
  },

  /**
   * PUT /users/me
   * @returns Updated UserProfileDto
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileDto> => {
    const res = await apiClient.put<UserProfileDto>('/users/me', data);
    return res.data;
  },

  /**
   * POST /users/me/profile
   * Create a profile for the first time (onboarding).
   * @returns Created UserProfileDto
   */
  createProfile: async (data: CreateProfileRequest): Promise<UserProfileDto> => {
    const res = await apiClient.post<UserProfileDto>('/users/me/profile', data);
    return res.data;
  },

  /**
   * DELETE /users/me/profile
   * Delete the current user's profile.
   * @returns Success message string
   */
  deleteProfile: async (): Promise<string> => {
    const res = await apiClient.delete<string>('/users/me/profile');
    return res.data;
  },

  /**
   * POST /users/me/change-password
   * @returns Success message string
   */
  changePassword: async (data: ChangePasswordRequest): Promise<string> => {
    const res = await apiClient.post<string>('/users/me/change-password', data);
    return res.data;
  },

  /**
   * POST /users/me/complete-onboarding
   * Called once after a new Google sign-up to choose role + fill profile.
   */
  completeOnboarding: async (data: {
    role: 'USER' | 'LANDLORD';
    phone?: string;
    university?: string;
    bio?: string;
  }): Promise<import('../types/auth').UserProfileDto> => {
    const res = await apiClient.post<import('../types/auth').UserProfileDto>(
      '/users/me/complete-onboarding',
      data
    );
    return res.data;
  },
};

export default userService;
