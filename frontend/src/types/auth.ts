// ── Auth Types ─ Mirrors backend DTOs at com.totoro.auth.dto ────────

/** Matches backend Role enum (com.totoro.user.entity.Role) */
export type UserRole = 'STUDENT' | 'LANDLORD' | 'ADMIN';

// ── Request DTOs ────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ── Response DTOs ───────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

// ── User Profile DTOs ─ Mirrors backend at com.totoro.user.dto ─────

/** GET /api/users/me → response, PUT /api/users/me → response */
export interface UserProfileDto {
  id: number;
  email: string;
  role: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  university: string | null;
  isBlocked?: boolean;
}

/** PUT /api/users/me → request body */
export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  university?: string;
}

/** POST /api/users/me/change-password → request body */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** POST /api/users/me/profile → request body (first-time profile creation) */
export interface CreateProfileRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  university?: string;
}
