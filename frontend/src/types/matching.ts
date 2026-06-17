// ── Roommate Matching Types ─ Maps to DB schema ─────────────────────

export type Gender = 'male' | 'female' | 'other';
export type SleepTime = 'early' | 'normal' | 'late' | 'very_late';
export type WakeTime = 'early' | 'normal' | 'late';
export type SwipeDirection = 'LEFT' | 'RIGHT';
export type MatchStatus = 'active' | 'unmatched';

/** Maps to `roommate_profiles` table */
export interface RoommateProfile {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  avatar: string;
  gender?: Gender;
  university?: string;
  preferredCity?: string;
  preferredWard?: string;
  budgetMin: number;
  budgetMax: number;
  sleepTime?: SleepTime;
  wakeTime?: WakeTime;
  cleanliness: number; // 1-5
  isSmoker: boolean;
  drinksAlcohol: boolean;
  hasPets: boolean;
  isIntrovert?: boolean;
  okWithSmoker: boolean;
  okWithPets: boolean;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  compatibilityScore?: number; // 0-100, computed by AI
  location?: string; // e.g. "Quận 1, TP.HCM"
}

/** Maps to `roommate_swipes` table */
export interface RoommateSwipe {
  id: string;
  swiperId: string;
  targetId: string;
  direction: SwipeDirection;
  createdAt: string;
}

/** Maps to `roommate_matches` table */
export interface RoommateMatch {
  id: string;
  userAId: string;
  userBId: string;
  compatibilityScore?: number;
  status: MatchStatus;
  matchedAt: string;
}

/** Client-side filter state for browse page */
export interface MatchFilter {
  university: string;
  budgetMin: number;
  budgetMax: number;
  okWithSmoker?: boolean;
  okWithPets?: boolean;
  gender?: Gender | '';
}

/** Lifestyle tag for display on cards */
export interface LifestyleTag {
  icon: string;
  label: string;
}

// ── Backend API DTOs ────────────────────────────────────────────────

export interface RoommateProfileRequest {
  headline: string;
  bio?: string;
  preferredCity?: string;
  preferredWard?: string;
  budgetMin?: number;
  budgetMax?: number;
  isActive?: boolean;

  // Lifestyle fields (must match backend RoommateProfileRequest.java)
  age?: number;
  gender?: string;
  sleepTime?: string;
  wakeTime?: string;
  cleanliness?: number;
  isSmoker?: boolean;
  drinksAlcohol?: boolean;
  hasPets?: boolean;
  isIntrovert?: boolean;
  okWithSmoker?: boolean;
  okWithPets?: boolean;
}

export interface RoommateProfileResponse {
  id: number;
  userId: number;
  email: string;
  headline: string;
  bio: string | null;
  preferredCity: string | null;
  preferredWard: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Joined from UserProfile
  fullName?: string;
  avatar?: string;
  university?: string;

  // Lifestyle fields
  age?: number;
  gender?: Gender;
  sleepTime?: SleepTime;
  wakeTime?: WakeTime;
  cleanliness?: number;
  isSmoker?: boolean;
  drinksAlcohol?: boolean;
  hasPets?: boolean;
  isIntrovert?: boolean;
  okWithSmoker?: boolean;
  okWithPets?: boolean;

  // Frontend display properties (mocked or computed)
  compatibilityScore?: number;
  location?: string;
  isVerified?: boolean;
}

export interface SwipeRequest {
  targetUserId: number;
  direction: SwipeDirection;
}

export interface SwipeResponse {
  swipeId: number;
  targetUserId: number;
  direction: string;
  matched: boolean;
  matchId: number | null;
  matchedAt: string | null;
}

export interface RoommateMatchResponse {
  id: number;
  userAId: number;
  userBId: number;
  matchedAt: string;
}
