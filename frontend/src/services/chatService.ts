import apiClient from './apiClient';
import type { 
  CreateConversationRequest, 
  ConversationResponse, 
  MessageRequest, 
  MessageResponse,
  AddMemberRequest,
  MemberProfileDto,
} from '../types/chat';

export const chatService = {
  // ── Conversations ──────────────────────────────────────────────────

  createConversation: async (request: CreateConversationRequest): Promise<ConversationResponse> => {
    const response = await apiClient.post<ConversationResponse>('/conversations', request);
    return response.data;
  },

  getMyConversations: async (): Promise<ConversationResponse[]> => {
    const response = await apiClient.get<ConversationResponse[]>('/conversations');
    return response.data;
  },

  getConversation: async (id: number): Promise<ConversationResponse> => {
    const response = await apiClient.get<ConversationResponse>(`/conversations/${id}`);
    return response.data;
  },

  // ── Members ────────────────────────────────────────────────────────

  /**
   * POST /conversations/{id}/members
   * Add a member to a conversation.
   */
  addMember: async (conversationId: number, request: AddMemberRequest): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/members`, request);
  },

  /**
   * DELETE /conversations/{id}/members/{userId}
   * Remove a member from a conversation.
   */
  removeMember: async (conversationId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/conversations/${conversationId}/members/${userId}`);
  },

  /**
   * GET /conversations/{id}/members
   * List members of a conversation.
   */
  getMembers: async (conversationId: number): Promise<MemberProfileDto[]> => {
    const response = await apiClient.get<MemberProfileDto[]>(`/conversations/${conversationId}/members`);
    return response.data;
  },

  // ── Messages ───────────────────────────────────────────────────────

  getMessages: async (conversationId: number): Promise<MessageResponse[]> => {
    const response = await apiClient.get<MessageResponse[]>(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: number, request: MessageRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(`/conversations/${conversationId}/messages`, request);
    return response.data;
  },

  updateMessage: async (conversationId: number, messageId: number, request: MessageRequest): Promise<MessageResponse> => {
    const response = await apiClient.put<MessageResponse>(`/conversations/${conversationId}/messages/${messageId}`, request);
    return response.data;
  },

  deleteMessage: async (conversationId: number, messageId: number): Promise<void> => {
    await apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`);
  },
};

export const presenceService = {
  /** GET /api/presence/online — returns set of currently online user IDs */
  getOnlineUsers: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/presence/online');
    return response.data;
  },
};

export default chatService;
