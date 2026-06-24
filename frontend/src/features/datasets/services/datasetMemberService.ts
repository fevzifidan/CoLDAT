import apiService from "@/shared/services/api/api.service";

/**
 * Dataset member service
 */
export const datasetMemberService = {
  /**
   * GET /datasets/{datasetId}/members/
   * Lists all members of a dataset
   */
  getMembers: async (datasetId: string, { cursor = null, limit = 100 }: { cursor?: string | null; limit?: number } = {}) => {
    const params: Record<string, any> = { limit };
    if (cursor) params.after = cursor;
    return apiService.get(`/datasets/${datasetId}/members/`, { params, silent: true } as any);
  },

  /**
   * POST /datasets/{datasetId}/members/
   * Adds a new member to the dataset
   * Body: { username: string, role: "annotator" | "viewer" }
   */
  addMember: async (datasetId: string, payload: { username: string; role: string }) => {
    return apiService.post(`/datasets/${datasetId}/members/`, payload, { silent: true } as any);
  },

  /**
   * DELETE /datasets/{datasetId}/members/{memberId}/
   * Removes a member from the dataset using the membership ID (standard endpoint)
   */
  removeMember: async (datasetId: string, memberId: string) => {
    return apiService.delete(`/datasets/${datasetId}/members/${memberId}/`, { silent: true } as any);
  }
};

