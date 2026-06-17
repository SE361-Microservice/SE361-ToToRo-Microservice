import apiClient from './apiClient';
import type { TagDto } from '../types/listing';

// ── Tag API Service ─────────────────────────────────────────────────

const tagService = {
  /**
   * GET /tags
   * Get all tags. Public endpoint (but requires auth due to SecurityConfig).
   */
  getAll: async (): Promise<TagDto[]> => {
    const res = await apiClient.get<TagDto[]>('/tags');
    return res.data;
  },

  /**
   * POST /tags
   * Create a new tag. ADMIN only.
   */
  create: async (name: string, icon?: string): Promise<TagDto> => {
    const res = await apiClient.post<TagDto>('/tags', { name, icon });
    return res.data;
  },

  /**
   * DELETE /tags/:id
   * Delete a tag. ADMIN only.
   */
  delete: async (id: number): Promise<string> => {
    const res = await apiClient.delete<string>(`/tags/${id}`);
    return res.data;
  },

  /**
   * PUT /tags/:id
   * Update a tag. ADMIN only.
   */
  update: async (id: number, name?: string, icon?: string): Promise<TagDto> => {
    const res = await apiClient.put<TagDto>(`/tags/${id}`, { name, icon });
    return res.data;
  },
};

export default tagService;
