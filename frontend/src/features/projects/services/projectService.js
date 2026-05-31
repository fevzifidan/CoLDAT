import apiService from "@/shared/services/api/api.service";
const IS_TAXONOMY_MOCK = false;

export const projectService = {
  /**
   * 1. Tüm projeleri listele (GET /projects/)
   * Cursor-based pagination destekler.
   * @param {Object} [params] - { limit?: number, after?: string | null }
   */
  getAllProjects: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.after) queryParams.set('after', params.after);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiService.get(`projects/${query}`);
    return response;
  },

  /**
   * 2. Yeni proje oluştur (POST /projects/)
   */
  createProject: async (projectData) => {
    const response = await apiService.post('projects/', projectData);
    return response;
  },

  /**
   * 3. Proje detayını getir (GET /projects/{id}/)
   */
  getProjectById: async (id) => {
    const response = await apiService.get(`projects/${id}/`);
    return response;
  },

  /**
   * 4. Projeyi güncelle (PATCH /projects/{id}/)
   */
  updateProject: async (id, projectData) => {
    const response = await apiService.patch(
      `projects/${id}/`,
      projectData
    );
    return response;
  },

  /**
   * 5. Projeyi sil (DELETE /projects/{id}/)
   */
  deleteProject: async (id) => {
    const response = await apiService.delete(`projects/${id}/`);
    return response;
  },

    /**
   * ================= USER LOOKUP =================
   */

  lookupUsers: async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

        const response = await apiService.get(
      `users/lookup/?username=${encodeURIComponent(query)}`
    );

    return response.data || response || [];
  },

  /**
   * ================= TAXONOMY ENDPOINTS =================
   */

  getProjectTaxonomy: async (projectId) => {
    if (IS_TAXONOMY_MOCK) {
      const localData = localStorage.getItem(
        `mock_taxonomy_${projectId}`
      );

      if (localData) {
        return JSON.parse(localData);
      }

      return {
        classes: [],
        predicates: [],
        attributes: [],
      };
    }

    const response = await apiService.get(
      `projects/${projectId}/taxonomy/`
    );

    return response;
  },

  updateProjectTaxonomy: async (projectId, taxonomyData) => {
    if (IS_TAXONOMY_MOCK) {
      localStorage.setItem(
        `mock_taxonomy_${projectId}`,
        JSON.stringify(taxonomyData)
      );

      return {
        success: true,
        message: 'Taxonomy saved locally.',
      };
    }

    const response = await apiService.put(
      `projects/${projectId}/taxonomy/`,
      taxonomyData
    );

    return response;
  },

  
};

export default projectService;