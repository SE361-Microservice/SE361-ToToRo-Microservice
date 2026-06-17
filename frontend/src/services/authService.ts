import apiClient from './apiClient';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
} from '../types/auth';

// ── Auth API Service ────────────────────────────────────────────────

const authService = {
  /**
   * POST /auth/register
   * @returns Success message string
   */
  register: async (data: RegisterRequest): Promise<string> => {
    const res = await apiClient.post<string>('/auth/register', data);
    return res.data;
  },

  /**
   * POST /auth/login
   * @returns { accessToken, refreshToken, message }
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  /**
   * GET /auth/verify?token=xxx
   * @returns Success message string
   */
  verifyEmail: async (token: string): Promise<string> => {
    const res = await apiClient.get<string>('/auth/verify', {
      params: { token },
    });
    return res.data;
  },

  /**
   * POST /auth/forgot-password
   * @returns Success message string
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<string> => {
    const res = await apiClient.post<string>('/auth/forgot-password', data);
    return res.data;
  },

  /**
   * POST /auth/reset-password
   * @returns Success message string
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<string> => {
    const res = await apiClient.post<string>('/auth/reset-password', data);
    return res.data;
  },

  /**
   * POST /auth/refresh-token
   * @returns { accessToken, refreshToken, message }
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/refresh-token', data);
    return res.data;
  },
};

export default authService;
