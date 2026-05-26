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
  // GET /projects/{projectId}/datasets/
  getAllDatasets: async (projectId) => {
    if (!projectId || projectId === "null" || projectId === "default-project") {
      return [];
    }

    if (IS_MOCK) {
      return getLocalDatasets(projectId);
    }

    try {
      const response = await apiService.get(`projects/${projectId}/datasets/`, {
        headers: (() => {
          const token =
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            JSON.parse(localStorage.getItem('auth_store') || '{}')?.token;

          return token ? { Authorization: `Bearer ${token}` } : {};
        })()
      });

      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.results)) return response.data.results;
      if (Array.isArray(response?.results)) return response.results;

      if (response && typeof response === 'object') {
        const potentialArray = Object.values(response).find(val => Array.isArray(val));
        if (potentialArray) return potentialArray;

        if (response.data && typeof response.data === 'object') {
          const potentialDataArray = Object.values(response.data).find(val => Array.isArray(val));
          if (potentialDataArray) return potentialDataArray;
        }
      }

      return [];
    } catch (error) {
      console.error(`getAllDatasets Hatası (${projectId}):`, error);
      return [];
    }
  },

  // POST /projects/{projectId}/datasets/
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
        dataset_type: datasetData.dataset_type || "text",
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
      datasetData,
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

  removeDatasetMember: async (datasetId, memberId) => {
    if (IS_MOCK) return { success: true };

    return await apiService.delete(`/datasets/${datasetId}/members/${memberId}/`, {
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