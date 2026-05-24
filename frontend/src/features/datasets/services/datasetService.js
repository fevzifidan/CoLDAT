// src/features/datasets/services/datasetService.js
import apiService from '@/shared/services/api/apiClient';

// Backend bağlanana kadar simülasyon modunu aktif tutuyoruz (true)
// Backend hazır olduğunda tek yapman gereken bunu false yapmak!
const IS_MOCK = true;

// --- LocalStorage Simülasyon Yardımcı Fonksiyonları ---
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
    // Eğer geçerli bir projectId yoksa backend'e hiç gitme, direkt boş liste dön
    if (!projectId || projectId === "null" || projectId === "default-project") {
      return [];
    }

    // --- SİMÜLASYON MODU ---
    if (IS_MOCK) {
      return getLocalDatasets(projectId);
    }

    // --- GERÇEK BACKEND MODU ---
    try {
      const response = await apiService.get(`/projects/${projectId}/datasets/`);
      return Array.isArray(response) ? response : (response?.data?.results || response?.data || response?.results || []);
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
    
    // --- SİMÜLASYON MODU ---
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

    // --- GERÇEK BACKEND MODU ---
    const response = await apiService.post(`/projects/${projectId}/datasets/`, datasetData);
    return response?.data || response;
  },

  // DELETE /datasets/{datasetId}/
  deleteDataset: async (id) => {
    // --- SİMÜLASYON MODU ---
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

    // --- GERÇEK BACKEND MODU ---
    return await apiService.delete(`/datasets/${id}/`);
  },

  // ---- DATASET MEMBERS ENDPOINTS ----
  getDatasetMembers: async (datasetId) => {
    if (IS_MOCK) return [];
    const response = await apiService.get(`/datasets/${datasetId}/members/`);
    return response?.data || response || [];
  },

  // "Tarayıcı" olan kısım addDatasetMember olarak düzeltildi
  addDatasetMember: async (datasetId, memberData) => {
    if (IS_MOCK) return { success: true };
    const response = await apiService.post(`/datasets/${datasetId}/members/`, memberData);
    return response?.data || response;
  },

  updateDatasetMember: async (datasetId, memberId, memberData) => {
    if (IS_MOCK) return { success: true };
    const response = await apiService.patch(`/datasets/${datasetId}/members/${memberId}/`, memberData);
    return response?.data || response;
  },

  removeDatasetMember: async (datasetId, memberId) => {
    if (IS_MOCK) return { success: true };
    return await apiService.delete(`/datasets/${datasetId}/members/${memberId}/`);
  }
};