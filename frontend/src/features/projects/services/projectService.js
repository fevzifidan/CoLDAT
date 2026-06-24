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
    if (params.limit != null) queryParams.set('limit', String(params.limit));
    if (params.after) queryParams.set('after', params.after);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiService.get(`projects/${query}`);
    return response;
  },

    /**
   * 2. Proje detayını getir (GET /projects/{projectId})
   * Backend response: ProjectSerializer (id, name, description, owner_id, owner_username, is_archived, created_at, updated_at)
   * @param {string} id - Project UUID
   */
  getProject: async (id) => {
    const response = await apiService.get(`projects/${id}/`);
    return response;
  },

  /**
   * 3. Yeni proje oluştur (POST /projects/)
   * API spec body: { name, description }
   */
  createProject: async (projectData) => {
    const response = await apiService.post('projects/', projectData);
    return response;
  },

    /**
   * 4. Projeyi sil (DELETE /projects/{projectId})
   */
  deleteProject: async (id) => {
    const response = await apiService.delete(`projects/${id}/`);
    return response;
  },

  /**
   * 5. Projeyi güncelle (PATCH /projects/{projectId})
   * API spec body (partial): { name?, description? }
   * @param {string} id - Project UUID
   * @param {object} projectData - { name?, description? }
   */
  updateProject: async (id, projectData) => {
    const response = await apiService.patch(`projects/${id}/`, projectData);
    return response;
  },

  /**
   * ================= USER LOOKUP =================
   */
    /**
   * GET /users/lookup?username=
   * Kullanıcı araması. Backend'den { id, username, first_name, last_name } döner veya 404.
   */
  lookupUsers: async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

        // API spec: direkt obje döner (axios interceptor zaten response.data'yı unwrap eder)
    const userData = await apiService.get(
      `users/lookup/?q=${encodeURIComponent(query)}`
    );

    return userData ? userData : [];
  },

  /**
   * ================= PROJECT MEMBERS =================
   */

    /**
   * GET /projects/{projectId}/members/
   * Proje üyelerini listeler.
   * @param {string} projectId
   * @param {Object} [params] - { limit?, after?, exclude_dataset_members?: string }
   *   exclude_dataset_members: Belirtilen dataset ID'sine sahip dataset'in mevcut
   *   üyelerini sonuçtan hariç tutar (AddDatasetMembersPage için).
   */
  getProjectMembers: async (projectId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit != null) queryParams.set('limit', String(params.limit));
    if (params.after) queryParams.set('after', params.after);
    if (params.exclude_dataset_members) queryParams.set('exclude_dataset_members', params.exclude_dataset_members);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiService.get(`projects/${projectId}/members/${query}`);
  },

  /**
   * POST /projects/{projectId}/members/
   * Projeye yeni üye ekler.
   * @param {string} projectId
   * @param {Object} payload - { user_id: string }
   */
  addProjectMember: async (projectId, payload) => {
    return apiService.post(`projects/${projectId}/members/`, payload);
  },

  /**
   * DELETE /projects/{projectId}/members/{membershipId}/
   * Projeden üye çıkarır.
   * @param {string} projectId
   * @param {string} membershipId - ProjectMembership UUID
   */
  removeProjectMember: async (projectId, membershipId) => {
    return apiService.delete(`projects/${projectId}/members/${membershipId}/`);
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

  /**
   * ================= TAXONOMY INDIVIDUAL PATCH ENDPOINTS =================
   */

  /**
   * PATCH /projects/{projectId}/taxonomy/classes/{classId}
   * Tek bir class'ın alanlarını kısmi olarak günceller.
   * @param {string} projectId
   * @param {string|number} classId
   * @param {Object} payload - { name?, color?, isActive?, includeInExport? }
   */
  updateClass: async (projectId, classId, payload) => {
    const response = await apiService.patch(
      `projects/${projectId}/taxonomy/classes/${classId}/`,
      payload
    );
    return response;
  },

  /**
   * PATCH /projects/{projectId}/taxonomy/predicates/{predicateId}
   * Tek bir predicate'in alanlarını kısmi olarak günceller.
   * @param {string} projectId
   * @param {string|number} predicateId
   * @param {Object} payload - { name?, isActive?, includeInExport? }
   */
  updatePredicate: async (projectId, predicateId, payload) => {
    const response = await apiService.patch(
      `projects/${projectId}/taxonomy/predicates/${predicateId}/`,
      payload
    );
    return response;
  },

  /**
   * PATCH /projects/{projectId}/taxonomy/attributes/{attributeId}
   * Tek bir attribute'un alanlarını kısmi olarak günceller.
   * @param {string} projectId
   * @param {string|number} attributeId
   * @param {Object} payload
   */
  updateAttribute: async (projectId, attributeId, payload) => {
    const response = await apiService.patch(
      `projects/${projectId}/taxonomy/attributes/${attributeId}/`,
      payload
    );
    return response;
  },

  /**
   * DELETE /projects/{projectId}/taxonomy?type=...&targetId=...
   * Bir taksonomi öğesini ve ona bağlı tüm geçmiş etiketlemeleri kalıcı olarak siler.
   * Sadece admin tarafından gerçekleştirilebilir.
   * @param {string} projectId
   * @param {string} type - 'class', 'predicate', veya 'attribute'
   * @param {string} targetId - silinecek öğenin UUID'si
   */
  deleteTaxonomyItem: async (projectId, type, targetId) => {
    const queryParams = new URLSearchParams({ type, targetId });
    const response = await apiService.delete(
      `projects/${projectId}/taxonomy/?${queryParams.toString()}`
    );
    return response;
  },
};

export default projectService;