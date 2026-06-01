// src/features/datasets/services/datasetService.js
import apiService from '@/shared/services/api/apiClient';

/** * MOCK VERİLER (Backend hazır olana kadar arayüzü test etmek için)
 */
const MOCK_DATA = {
  datasets: [
    { id: "1", name: "Autonomous Driving", description: "City traffic data", total_images: 120, annotated_images: 50, role: 'admin' },
    { id: "2", name: "Medical Records", description: "X-Ray archives", total_images: 450, annotated_images: 450, role: 'viewer' }
  ],
  apiKeys: [
    { id: "key_1", name: "Production Key", created_at: "2026-05-20", is_active: true },
    { id: "key_2", name: "Staging Key", created_at: "2026-05-21", is_active: false }
  ]
};

export const datasetService = {
  getAllDatasets: async () => {
    try {
      return await apiService.get('/datasets');
    } catch (error) {
      console.warn("Mocking: getAllDatasets");
      return MOCK_DATA.datasets;
    }
  },

  createDataset: async (datasetData) => {
    try {
      return await apiService.post('/datasets', datasetData);
    } catch (error) {
      console.warn("Mocking: createDataset", datasetData);
      return { data: { ...datasetData, id: Math.random().toString() } };
    }
  },

  deleteDataset: async (id) => {
    try {
      return await apiService.delete(`/datasets/${id}`);
    } catch (error) {
      console.warn("Mocking: deleteDataset", id);
      return;
    }
  },

  getApiKeys: async (datasetId) => {
    try {
      return await apiService.get(`/datasets/${datasetId}/api-keys`);
    } catch (error) {
      console.warn("Mocking: getApiKeys");
      return MOCK_DATA.apiKeys;
    }
  },

  createApiKey: async (datasetId, keyData) => {
    try {
      return await apiService.post(`/datasets/${datasetId}/api-keys`, keyData);
    } catch (error) {
      console.warn("Mocking: createApiKey", keyData);
      return { data: { id: "new_key_" + Date.now(), ...keyData, is_active: true } };
    }
  },

  revealApiKey: async (datasetId, keyId) => {
    try {
      return await apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`);
    } catch (error) {
      return { data: { api_key: "sk_mock_live_51MzJk..." } };
    }
  },

  deleteApiKey: async (datasetId, keyId) => {
    try {
      return await apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`);
    } catch (error) {
      console.warn("Mocking: deleteApiKey", keyId);
      return;
    }
  }
};