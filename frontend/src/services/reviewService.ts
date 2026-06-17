import apiClient from './apiClient';
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponse,
  ReviewImageResponse,
  ReviewSourceResponse,
  ReviewUpvoteResponse,
} from '../types/review';

// ── Review API Service ──────────────────────────────────────────────

export const reviewService = {
  // ── Core CRUD ──────────────────────────────────────────────────────

  /**
   * POST /reviews
   * Create a new review for a listing.
   */
  createReview: async (request: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await apiClient.post<ReviewResponse>('/reviews', request);
    return response.data;
  },

  /**
   * GET /reviews?listingId=
   * Get all reviews for a specific listing.
   */
  getReviewsByListing: async (listingId: number): Promise<ReviewResponse[]> => {
    const response = await apiClient.get<ReviewResponse[]>('/reviews', {
      params: { listingId },
    });
    return response.data;
  },

  /**
   * GET /reviews/{id}
   * Get a single review by ID.
   */
  getReviewById: async (reviewId: number): Promise<ReviewResponse> => {
    const response = await apiClient.get<ReviewResponse>(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * GET /reviews/my-reviews
   * Get all reviews written by the current user.
   */
  getMyReviews: async (): Promise<ReviewResponse[]> => {
    const response = await apiClient.get<ReviewResponse[]>('/reviews/my-reviews');
    return response.data;
  },

  /**
   * PUT /reviews/{id}
   * Update an existing review. Owner only.
   */
  updateReview: async (reviewId: number, request: UpdateReviewRequest): Promise<ReviewResponse> => {
    const response = await apiClient.put<ReviewResponse>(`/reviews/${reviewId}`, request);
    return response.data;
  },

  /**
   * DELETE /reviews/{id}
   * Delete a review. Owner only.
   */
  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // ── Review Images ─────────────────────────────────────────────────

  /**
   * POST /reviews/{id}/images (multipart/form-data)
   * Upload an image for a review.
   */
  uploadImage: async (reviewId: number, file: File): Promise<ReviewImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ReviewImageResponse>(
      `/reviews/${reviewId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  /**
   * GET /reviews/{id}/images
   * Get all images for a review.
   */
  getImages: async (reviewId: number): Promise<ReviewImageResponse[]> => {
    const response = await apiClient.get<ReviewImageResponse[]>(`/reviews/${reviewId}/images`);
    return response.data;
  },

  /**
   * DELETE /reviews/{id}/images/{imageId}
   * Delete a specific image from a review.
   */
  deleteImage: async (reviewId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}/images/${imageId}`);
  },

  // ── Review Sources ────────────────────────────────────────────────

  /**
   * POST /reviews/{id}/sources (multipart/form-data)
   * Upload a source file for a review.
   */
  uploadSource: async (reviewId: number, file: File): Promise<ReviewSourceResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ReviewSourceResponse>(
      `/reviews/${reviewId}/sources`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  /**
   * GET /reviews/{id}/sources
   * Get all source files for a review.
   */
  getSources: async (reviewId: number): Promise<ReviewSourceResponse[]> => {
    const response = await apiClient.get<ReviewSourceResponse[]>(`/reviews/${reviewId}/sources`);
    return response.data;
  },

  /**
   * DELETE /reviews/{id}/sources/{sourceId}
   * Delete a specific source file from a review.
   */
  deleteSource: async (reviewId: number, sourceId: number): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}/sources/${sourceId}`);
  },

  // ── Upvotes ───────────────────────────────────────────────────────

  /**
   * POST /reviews/{id}/upvotes
   * Upvote a review.
   */
  upvote: async (reviewId: number): Promise<ReviewUpvoteResponse> => {
    const response = await apiClient.post<ReviewUpvoteResponse>(`/reviews/${reviewId}/upvotes`);
    return response.data;
  },

  /**
   * DELETE /reviews/{id}/upvotes
   * Remove an upvote from a review.
   */
  removeUpvote: async (reviewId: number): Promise<ReviewUpvoteResponse> => {
    const response = await apiClient.delete<ReviewUpvoteResponse>(`/reviews/${reviewId}/upvotes`);
    return response.data;
  },
};

export default reviewService;
