// src/features/datasets/services/datasetService.js
import apiService from "@/shared/services/api/api.service";

// 🎯 BACKEND BAĞLANTISI İÇİN MOCK MODUNU KAPATIYORUZ!
const IS_MOCK = false;

const getLocalDatasets = (projectId) => {
  const allData = localStorage.getItem(`mock_datasets_${projectId}`);
  return allData ? JSON.parse(allData) : [];
};

const saveLocalDatasets = (projectId, datasets) => {
  localStorage.setItem(`mock_datasets_${projectId}`, JSON.stringify(datasets));
};

export const datasetService = {
  /**
   * GET /datasets/
   * Cursor-based pagination ile kullanıcının erişebildiği tüm dataset'leri listeler.
   * @param {Object} [params] - { limit?: number, after?: string | null }
   */
  fetchAllDatasets: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.after) queryParams.set('after', params.after);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await apiService.get(`datasets/${query}`);
      return response;
    } catch (error) {
      console.error('fetchAllDatasets Hatası:', error);
      return { data: [], next_cursor: null };
    }
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

    if (IS_MOCK) {
      const data = getLocalDatasets(projectId);
      return { data, next_cursor: null };
    }

    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.after) queryParams.set('after', params.after);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const response = await apiService.get(`projects/${projectId}/datasets/${query}`, {
        headers: (() => {
          const token =
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

          return token ? { Authorization: `Bearer ${token}` } : {};
        })()
      });

      // Backend format: { data: [...], next_cursor: "..." }
      if (response?.data && typeof response.next_cursor !== 'undefined') {
        return response;
      }

      // Fallback: eski format desteği
      if (Array.isArray(response)) return { data: response, next_cursor: null };
      if (Array.isArray(response?.data)) return { data: response.data, next_cursor: response.next_cursor ?? null };
      if (Array.isArray(response?.results)) return { data: response.results, next_cursor: null };
      if (Array.isArray(response?.data?.results)) return { data: response.data.results, next_cursor: null };

      if (response && typeof response === 'object') {
        const potentialArray = Object.values(response).find(val => Array.isArray(val));
        if (potentialArray) return { data: potentialArray, next_cursor: null };

        if (response.data && typeof response.data === 'object') {
          const potentialDataArray = Object.values(response.data).find(val => Array.isArray(val));
          if (potentialDataArray) return { data: potentialDataArray, next_cursor: null };
        }
      }

      return { data: [], next_cursor: null };
    } catch (error) {
      console.error(`getAllDatasets Hatası (${projectId}):`, error);
      return { data: [], next_cursor: null };
    }
  },

    // POST /projects/{projectId}/datasets/
  // API Design spec: { name, description, initial_version_note }
  createDataset: async (projectId, datasetData) => {
    if (!projectId || projectId === "null" || projectId === "default-project") {
      throw new Error("Dataset oluşturmak için önce bir projenin içine girmelisiniz.");
    }

    if (IS_MOCK) {
      const currentDatasets = getLocalDatasets(projectId);
      const newDataset = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        name: datasetData.name,
        description: datasetData.description || "No description provided.",
        created_at: new Date().toISOString(),
        status: "OWNER",
        role: "OWNER",
        isDeleted: false
      };
      const updated = [newDataset, ...currentDatasets];
      saveLocalDatasets(projectId, updated);
      return newDataset;
    }

    const response = await apiService.post(
      `projects/${projectId}/datasets/`,
      {
        name: datasetData.name,
        description: datasetData.description || "",
        initial_version_note: datasetData.initial_version_note || `Initial creation of ${datasetData.name}`,
      },
      {
        headers: (() => {
          const token =
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

          return token ? { Authorization: `Bearer ${token}` } : {};
        })()
      }
    );

    return response?.data || response;
  },

  // DELETE /datasets/{datasetId}/
deleteDataset: async (id) => {
    if (IS_MOCK) {
      for (let key in localStorage) {
        if (key.startsWith("mock_datasets_")) {
          const datasets = JSON.parse(localStorage.getItem(key) || "[]");
          const filtered = datasets.filter(d => d.id !== id);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      }
      return { success: true };
    }

return await apiService.delete(`/datasets/${id}/`, {
      headers: (() => {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('token') ||
          JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

        return token ? { Authorization: `Bearer ${token}` } : {};
      })()
    });
  },

  // ---- DATASET MEMBERS ENDPOINTS ----
  getDatasetMembers: async (datasetId) => {
    if (IS_MOCK) return [];

    const response = await apiService.get(`/datasets/${datasetId}/members/`, {
      headers: (() => {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('token') ||
          JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

        return token ? { Authorization: `Bearer ${token}` } : {};
      })()
    });

    return response?.data || response || [];
  },

  addDatasetMember: async (datasetId, memberData) => {
    if (IS_MOCK) return { success: true };

    const response = await apiService.post(
      `/datasets/${datasetId}/members/`,
      memberData,
      {
        headers: (() => {
          const token =
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

          return token ? { Authorization: `Bearer ${token}` } : {};
        })()
      }
    );

    return response?.data || response;
  },

  updateDatasetMember: async (datasetId, memberId, memberData) => {
    if (IS_MOCK) return { success: true };

    const response = await apiService.patch(
      `/datasets/${datasetId}/members/${memberId}/`,
      memberData,
      {
        headers: (() => {
          const token =
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

          return token ? { Authorization: `Bearer ${token}` } : {};
        })()
      }
    );

    return response?.data || response;
  },

    /**
   * DELETE /datasets/{datasetId}/members?userId=<userId>
   * userId query parametresi olarak gönderilir (CoLDAT API spec).
   */
  removeDatasetMember: async (datasetId, userId) => {
    if (IS_MOCK) return { success: true };

    return await apiService.delete(`/datasets/${datasetId}/members/?userId=${userId}`, {
      headers: (() => {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('token') ||
          JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

        return token ? { Authorization: `Bearer ${token}` } : {};
      })()
    });
  }
};