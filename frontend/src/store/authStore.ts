import { create } from 'zustand';
import { tokenStorage } from '../services/apiClient';
import userService from '../services/userService';
import type { UserProfileDto } from '../types/auth';

// ── Auth Store ──────────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  /** True once hydrate() has completed (even if no tokens were found) */
  isHydrated: boolean;

  /** Current user profile (fetched after login) */
  user: UserProfileDto | null;

  /** True while fetchCurrentUser is in-flight */
  userLoading: boolean;

  /** Save tokens after successful login */
  login: (accessToken: string, refreshToken: string) => void;

  /** Clear tokens + user and redirect to login */
  logout: () => void;

  /** Hydrate store from localStorage (call once on app init) */
  hydrate: () => void;

  /** Fetch current user profile from GET /users/me */
  fetchCurrentUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  userLoading: false,

  login: (accessToken, refreshToken) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true, isHydrated: true });
  },

  logout: () => {
    tokenStorage.clear();
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
    });
  },

  hydrate: () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  fetchCurrentUser: async () => {
    if (!get().isAuthenticated) return;
    set({ userLoading: true });
    try {
      const profile = await userService.getCurrentUser();
      set({ user: profile, userLoading: false });
    } catch (err: unknown) {
      // Only logout if the interceptor couldn't fix it (i.e. refresh also failed).
      // The apiClient interceptor already handles 401 → refresh → retry.
      // If we still get an error here, the refresh token is truly invalid.
      console.warn('fetchCurrentUser failed after interceptor retry:', err);
      get().logout();
      set({ userLoading: false });
    }
  },
}));

export default useAuthStore;
