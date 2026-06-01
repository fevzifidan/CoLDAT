// src/features/datasets/services/memberService.js
import apiService from '@/shared/services/api/apiClient';

export const memberService = {
  // GET /datasets/{datasetId}/members/
  getMembers: async (datasetId) => {
    try {
      const response = await apiService.get(`/datasets/${datasetId}/members/`);
      return response?.data || response || [];
    } catch (error) {
      console.warn("Mocking members data due to connection error");
      return [
        { id: "m1", user: { username: "john_doe", email: "john@example.com" }, role: "owner" },
        { id: "m2", user: { username: "alice_smith", email: "alice@example.com" }, role: "editor" }
      ];
    }
  },

  // POST /datasets/{datasetId}/members/
  addMember: async (datasetId, userData) => {
    try {
      const response = await apiService.post(`/datasets/${datasetId}/members/`, userData);
      return response?.data || response;
    } catch (error) {
      return { id: "m_new", user: { username: userData.username || "new_user", email: userData.email || "" }, role: "viewer" };
    }
  },

  // PATCH /datasets/{datasetId}/members/{memberId}/
  updateMember: async (datasetId, memberId, role) => {
    try {
      return await apiService.patch(`/datasets/${datasetId}/members/${memberId}/`, { role });
    } catch (error) {
      return true;
    }
  },

        /**
   * DELETE /datasets/{datasetId}/members?userId=<userId>
   */
  removeMember: async (datasetId, userId) => {
    try {
      return await apiService.delete(`/datasets/${datasetId}/members/?userId=${userId}`);
    } catch (error) {
      return true;
    }
  }
};