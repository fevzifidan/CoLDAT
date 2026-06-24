// src/features/datasets/services/memberService.js
import apiService from '@/shared/services/api/api.service';

export const memberService = {
  // GET /datasets/{datasetId}/members/
  getMembers: async (datasetId) => {
      const response = await apiService.get(`/datasets/${datasetId}/members/`);
    const data = response?.data ?? response ?? [];
    // API spec response: { data: [ { user_id, username, role }, ... ], next_cursor }
    return data;
  },

  // POST /datasets/{datasetId}/members/
  // API spec body: { username: string, role: "admin" | "annotator" | "viewer" }
  addMember: async (datasetId, userData) => {
      const response = await apiService.post(`/datasets/${datasetId}/members/`, userData);
      return response?.data || response;
  },

  // PATCH /datasets/{datasetId}/members/{memberId}/
  updateMember: async (datasetId, memberId, role) => {
    const response = await apiService.patch(`/datasets/${datasetId}/members/${memberId}/`, { role });
    return response?.data || response;
  },

  /**
   * DELETE /datasets/{datasetId}/members/{memberId}/
   * Dataset'ten bir üyeyi membership ID'si ile siler.
   */
  removeMember: async (datasetId: string, memberId: string) => {
    const response = await apiService.delete(`/datasets/${datasetId}/members/${memberId}/`);
    // API spec: 204 No Content
    return response;
    }
};