// src/features/projects/services/projectService.js

import apiService from '../../../shared/services/api/apiClient';

const IS_TAXONOMY_MOCK = true;

// Tarayıcıda saklanan JWT token'ı dinamik olarak bulup getiren yardımcı fonksiyon
const getAuthHeaders = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('token') ||
    JSON.parse(localStorage.getItem('auth_store') || '{}')
      ?.token;

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export const projectService = {
  /**
   * 1. Tüm projeleri listele (GET /projects/)
   */
  getAllProjects: async () => {
    const response = await apiService.get('projects/', {
      headers: getAuthHeaders(),
    });

    return response;
  },

  /**
   * 2. Yeni proje oluştur (POST /projects/)
   */
  createProject: async (projectData) => {
    const response = await apiService.post(
      'projects/',
      projectData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  /**
   * 3. Proje detayını getir (GET /projects/{id}/)
   */
  getProjectById: async (id) => {
    const response = await apiService.get(
      `projects/${id}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  /**
   * 4. Projeyi güncelle (PATCH /projects/{id}/)
   */
  updateProject: async (id, projectData) => {
    const response = await apiService.patch(
      `projects/${id}/`,
      projectData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  /**
   * 5. Projeyi sil (DELETE /projects/{id}/)
   */
  deleteProject: async (id) => {
    const response = await apiService.delete(
      `projects/${id}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  /**
   * ================= MEMBERS ENDPOINTS =================
   */

  getProjectMembers: async (projectId) => {
    const response = await apiService.get(
      `projects/${projectId}/members/`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  addProjectMember: async (
    projectId,
    memberData
  ) => {
    const response = await apiService.post(
      `projects/${projectId}/members/`,
      memberData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  updateProjectMember: async (
    projectId,
    membershipId,
    memberData
  ) => {
    const response = await apiService.patch(
      `projects/${projectId}/members/${membershipId}/`,
      memberData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  removeProjectMember: async (
    projectId,
    membershipId
  ) => {
    const response = await apiService.delete(
      `projects/${projectId}/members/${membershipId}/`,
      {
        headers: getAuthHeaders(),
      }
    );

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
      `users/lookup/?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
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
      `projects/${projectId}/taxonomy/`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  updateProjectTaxonomy: async (
    projectId,
    taxonomyData
  ) => {
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
      taxonomyData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },

  attachDataset: async (projectId, datasetId) => {
    const response = await apiService.post(
      `projects/${projectId}/datasets/`,
      { dataset_id: datasetId },
      {
        headers: getAuthHeaders(),
      }
    );

    return response;
  },
};

export default projectService;