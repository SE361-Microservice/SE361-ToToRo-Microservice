export interface CreateReviewRequest {
  listingId: number;
  ratingOverall: number;
  ratingCleanliness?: number;
  ratingSecurity?: number;
  ratingLandlord?: number;
  ratingAccuracy?: number;
  content?: string;
}

/** PUT /reviews/{id} — mirrors BE UpdateReviewRequest */
export interface UpdateReviewRequest {
  ratingOverall: number;
  ratingCleanliness?: number;
  ratingSecurity?: number;
  ratingLandlord?: number;
  ratingAccuracy?: number;
  content?: string;
}

export interface ReviewSourceResponse {
  id: number;
  sourceType: string;
  sourceUrl: string;
}

/** Mirrors BE ReviewImageResponse */
export interface ReviewImageResponse {
  id: number;
  imageUrl: string;
  createdAt: string;
}

/** Mirrors BE ReviewUpvoteResponse */
export interface ReviewUpvoteResponse {
  reviewId: number;
  upvoteCount: number;
  upvoted: boolean;
}

export interface ReviewResponse {
  id: number;
  listingId: number;
  listingTitle: string;
  userId: number;
  userFullName: string;
  userAvatarUrl: string;
  ratingOverall: number;
  ratingCleanliness: number;
  ratingSecurity: number;
  ratingLandlord: number;
  ratingAccuracy: number;
  content: string | null;
  upvoteCount: number;
  landlordReplyContent: string | null;
  landlordRepliedAt: string | null;
  sources: ReviewSourceResponse[];
  createdAt: string;
  updatedAt: string;
}
