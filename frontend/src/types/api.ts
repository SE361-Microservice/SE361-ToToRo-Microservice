// ── Shared API Types ─ Mirrors backend generic DTOs ─────────────────

/**
 * Generic paginated response.
 * Mirrors: com.totoro.listing.dto.PageResponse<T>
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Standard pagination params sent as query parameters */
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
