// src/features/datasets/services/datasetService.js
import apiService from '@/shared/services/api/apiClient';

/**
 * @typedef {Object} Dataset
 * @property {string} id
 * @property {string} [project_id]
 * @property {string} name
 * @property {string} description
 * @property {string} [current_version]
 * @property {number} [total_images]
 * @property {number} [annotated_images]
 * @property {'admin' | 'annotator' | 'viewer'} [role]
 */

/**
 * @typedef {Object} ApiKey
 * @property {string} id
 * @property {string} name
 * @property {string} [api_key]
 * @property {string} created_at
 * @property {boolean} is_active
 * @property {string} [expires_at]
 */

export const datasetService = {
  /**
   * 1. Tüm Veri Setlerini Listele (GET /datasets)
   * @returns {Promise<Dataset[]>}
   */
  getAllDatasets: () => {
    return apiService.get('/datasets');
  },

  /**
   * 2. Yeni Veri Seti Oluştur (POST /datasets)
   * @param {Object} datasetData
   * @returns {Promise<Dataset>}
   */
  createDataset: (datasetData) => {
    return apiService.post('/datasets', datasetData);
  },

  /**
   * 3. Veri Setini Sistemden Sil (DELETE /datasets/{id})
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteDataset: (id) => {
    return apiService.delete(`/datasets/${id}`);
  },

  /**
   * 4. Veri Setine Bağlı API Key'leri Listele (GET /datasets/{datasetId}/api-keys)
   * @param {string} datasetId
   * @returns {Promise<ApiKey[]>}
   */
  getApiKeys: (datasetId) => {
    return apiService.get(`/datasets/${datasetId}/api-keys`);
  },

  /**
   * 5. Veri Seti için API Key Oluştur (POST /datasets/{datasetId}/api-keys)
   * @param {string} datasetId
   * @param {Object} keyData
   * @returns {Promise<ApiKey>}
   */
  createApiKey: (datasetId, keyData) => {
    return apiService.post(`/datasets/${datasetId}/api-keys`, keyData);
  },

  /**
   * 6. API Key'i Tamamen Görünür Yap (GET /datasets/{datasetId}/api-keys/{keyId}/reveal)
   * @param {string} datasetId
   * @param {string} keyId
   * @returns {Promise<ApiKey>}
   */
  revealApiKey: (datasetId, keyId) => {
    return apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`);
  },

  /**
   * 7. API Key İptal Et/Sil (DELETE /datasets/{datasetId}/api-keys/{keyId})
   * @param {string} datasetId
   * @param {string} keyId
   * @returns {Promise<void>}
   */
  deleteApiKey: (datasetId, keyId) => {
    return apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`);
  }
};