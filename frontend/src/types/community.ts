export interface CreateCommunityPostRequest {
  title: string;
  content: string;
  listingId?: number;
  imageUrls?: string[];
}

export interface UpdateCommunityPostRequest {
  title: string;
  content: string;
  listingId?: number;
}

export interface CommunityPostResponse {
  id: number;
  authorId: number;
  authorEmail: string;
  authorName: string | null;
  authorAvatar: string | null;
  title: string;
  content: string;
  listingId: number | null;
  imageUrls: string[];

  // Enriched listing info
  listingTitle: string | null;
  listingAddress: string | null;
  listingCoverImage: string | null;
  listingPrice: number | null;

  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityCommentRequest {
  content: string;
  parentId?: number;
  imageUrl?: string;
}

export interface UpdateCommunityCommentRequest {
  content: string;
}

export interface CommunityCommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorEmail: string;
  authorName: string | null;
  authorAvatar: string | null;
  parentId: number | null;
  content: string;
  imageUrl: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
