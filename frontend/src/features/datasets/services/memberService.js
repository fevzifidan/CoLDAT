// src/features/datasets/services/memberService.js
import apiService from '@/shared/services/api/apiClient';

export const memberService = {
  // GET /datasets/{datasetId}/members/
  getMembers: async (datasetId) => {
      const response = await apiService.get(`/datasets/${datasetId}/members/`);
    const data = response?.data ?? response ?? [];
    // API spec response: { data: [ { user_id, username, role }, ... ], next_cursor }
    return data;
  },

  // POST /datasets/{datasetId}/members/
  // API spec body: { username: string, role: "annotator" | "viewer" }
  addMember: async (datasetId, userData) => {
      const response = await apiService.post(`/datasets/${datasetId}/members/`, userData);
      return response?.data || response;
  },

  // PATCH /datasets/{datasetId}/members/{userId}/
  updateMember: async (datasetId, userId, role) => {
    const response = await apiService.patch(`/datasets/${datasetId}/members/${userId}/`, { role });
    return response?.data || response;
  },

        /**
   * DELETE /datasets/{datasetId}/members?userId=<userId>
   */
  removeMember: async (datasetId, userId) => {
    const response = await apiService.delete(`/datasets/${datasetId}/members/?userId=${userId}`);
    // API spec: 204 No Content
    return response;
    }
};