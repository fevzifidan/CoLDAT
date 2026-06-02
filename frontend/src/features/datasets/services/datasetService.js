// src/features/datasets/services/datasetService.js
import apiService from "@/shared/services/api/api.service";

export const datasetService = {
  /**
   * GET /datasets/
   * Cursor-based pagination ile kullanıcının erişebildiği tüm dataset'leri listeler.
   * @param {Object} [params] - { limit?: number, after?: string | null }
   */
  fetchAllDatasets: async (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.after) queryParams.set('after', params.after);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await apiService.get(`datasets/${query}`);
      return response;
  },

  /**
   * GET /datasets/{datasetId}/
   * Tek bir dataset'in detaylarını getirir.
   */
  getDatasetById: async (datasetId) => {
    const response = await apiService.get(`/datasets/${datasetId}/`);
    return response;
  },

  // GET /projects/{projectId}/datasets/
  // Cursor-based pagination destekler.
  // @param {Object} [params] - { limit?: number, after?: string | null }
  getAllDatasets: async (projectId, params = {}) => {
    if (!projectId || projectId === "null" || projectId === "default-project") {
      return { data: [], next_cursor: null };
    }

      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.after) queryParams.set('after', params.after);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await apiService.get(`projects/${projectId}/datasets/${query}`);

    // API spec format: { data: [...], next_cursor: "..." }
      if (response?.data && typeof response.next_cursor !== 'undefined') {
        return response;
      }

      // Fallback: eski format desteği
      if (Array.isArray(response)) return { data: response, next_cursor: null };
      if (Array.isArray(response?.data)) return { data: response.data, next_cursor: response.next_cursor ?? null };
      if (Array.isArray(response?.results)) return { data: response.results, next_cursor: null };
      return { data: [], next_cursor: null };
  },

    // POST /projects/{projectId}/datasets/
  // API Design spec: { name, description, initial_version_note }
  createDataset: async (projectId, datasetData) => {
    if (!projectId || projectId === "null" || projectId === "default-project") {
      throw new Error("Dataset oluşturmak için önce bir projenin içine girmelisiniz.");
    }

    const response = await apiService.post(
      `projects/${projectId}/datasets/`,
      {
        name: datasetData.name,
        description: datasetData.description || "",
        initial_version_note: datasetData.initial_version_note || `Initial creation of ${datasetData.name}`,
      }
    );

    return response?.data || response;
  },

  // DELETE /datasets/{datasetId}/
deleteDataset: async (id) => {
    const response = await apiService.delete(`/datasets/${id}/`);
    return response;
  },

  // ---- DATASET MEMBERS ENDPOINTS ----
  getDatasetMembers: async (datasetId) => {
    const response = await apiService.get(`/datasets/${datasetId}/members/`);
    return response?.data || response || [];
  },

  addDatasetMember: async (datasetId, memberData) => {
    const response = await apiService.post(
      `/datasets/${datasetId}/members/`,
      memberData
    );
    return response?.data || response;
  },

  updateDatasetMember: async (datasetId, memberId, memberData) => {
    const response = await apiService.patch(
      `/datasets/${datasetId}/members/${memberId}/`,
      memberData
    );
    return response?.data || response;
  },

    /**
   * DELETE /datasets/{datasetId}/members?userId=<userId>
   * userId query parametresi olarak gönderilir (CoLDAT API spec).
   */
  removeDatasetMember: async (datasetId, userId) => {
    const response = await apiService.delete(`/datasets/${datasetId}/members/?userId=${userId}`);
    return response;
  }
};