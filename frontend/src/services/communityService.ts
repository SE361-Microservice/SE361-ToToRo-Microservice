import apiClient from './apiClient';
import type { 
  CommunityPostResponse, 
  CreateCommunityPostRequest, 
  UpdateCommunityPostRequest,
  CommunityCommentResponse,
  CreateCommunityCommentRequest,
  UpdateCommunityCommentRequest
} from '../types/community';

export const communityService = {
  // ── Posts ──────────────────────────────────────────────
  getPosts: async (): Promise<CommunityPostResponse[]> => {
    const response = await apiClient.get<CommunityPostResponse[]>('/community/posts');
    return response.data;
  },

  getPostById: async (postId: number): Promise<CommunityPostResponse> => {
    const response = await apiClient.get<CommunityPostResponse>(`/community/posts/${postId}`);
    return response.data;
  },

  createPost: async (request: CreateCommunityPostRequest): Promise<CommunityPostResponse> => {
    const response = await apiClient.post<CommunityPostResponse>('/community/posts', request);
    return response.data;
  },

  updatePost: async (postId: number, request: UpdateCommunityPostRequest): Promise<CommunityPostResponse> => {
    const response = await apiClient.put<CommunityPostResponse>(`/community/posts/${postId}`, request);
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/community/posts/${postId}`);
  },

  // ── Comments ───────────────────────────────────────────
  getComments: async (postId: number): Promise<CommunityCommentResponse[]> => {
    const response = await apiClient.get<CommunityCommentResponse[]>(`/community/posts/${postId}/comments`);
    return response.data;
  },

  createComment: async (postId: number, request: CreateCommunityCommentRequest): Promise<CommunityCommentResponse> => {
    const response = await apiClient.post<CommunityCommentResponse>(`/community/posts/${postId}/comments`, request);
    return response.data;
  },

  updateComment: async (postId: number, commentId: number, request: UpdateCommunityCommentRequest): Promise<CommunityCommentResponse> => {
    const response = await apiClient.put<CommunityCommentResponse>(`/community/posts/${postId}/comments/${commentId}`, request);
    return response.data;
  },

  deleteComment: async (postId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/community/posts/${postId}/comments/${commentId}`);
  },

  // ── Likes ─────────────────────────────────────────────
  toggleLike: async (postId: number): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiClient.post<{ liked: boolean; likeCount: number }>(`/community/posts/${postId}/like`);
    return response.data;
  },
};

export default communityService;
