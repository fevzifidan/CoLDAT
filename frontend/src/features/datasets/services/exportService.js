// frontend/src/features/datasets/services/exportService.js
import apiService from "@/shared/services/api/api.service";

export const exportService = {
  /**
   * GET /datasets/{datasetId}/api-keys
   * Dataset'e ait tüm API anahtarlarını listeler.
   */
  getApiKeys: async (datasetId) => {
    const response = await apiService.get(`/datasets/${datasetId}/api-keys`);
    return response.data || response;
  },

  /**
   * POST /datasets/{datasetId}/api-keys
   * Yeni bir API Anahtarı üretir.
   * @param {Object} payload - { name, ttl_days, target_version }
   */
  createApiKey: async (datasetId, payload) => {
    const response = await apiService.post(`/datasets/${datasetId}/api-keys`, payload);
    return response.data || response;
  },

  /**
   * POST /datasets/{datasetId}/api-keys/actions/revoke-all
   * Acil durum: Tüm aktif anahtarları tek seferde iptal eder (Panic Button).
   */
  revokeAllKeys: async (datasetId) => {
    const response = await apiService.post(`/datasets/${datasetId}/api-keys/actions/revoke-all`);
    return response.data || response;
  },

  /**
   * PATCH /datasets/{datasetId}/api-keys/{keyId}
   * Anahtar detaylarını günceller (isim, uzatma veya pasife çekme).
   */
  updateApiKey: async (datasetId, keyId, payload) => {
    const response = await apiService.patch(`/datasets/${datasetId}/api-keys/${keyId}`, payload);
    return response.data || response;
  },

  /**
   * DELETE /datasets/{datasetId}/api-keys/{keyId}
   * Bir API anahtarını kalıcı olarak siler.
   */
  deleteApiKey: async (datasetId, keyId) => {
    const response = await apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`);
    return response.data || response;
  },

    /**
   * GET /datasets/{datasetId}/api-keys/{keyId}/reveal
   * Maskelenmiş anahtarın orijinal halini gizli modda gösterir.
   */
  revealApiKey: async (datasetId, keyId) => {
    const response = await apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`);
    return response.data || response;
  },

  // ========== EXPORT DOWNLOAD ENDPOINT ==========

  /**
   * GET /datasets/{datasetId}/export
   * Etiketlenmiş verileri indirilebilir formatta dışa aktarır.
   * Public endpoint - hem Bearer JWT hem de X-API-KEY ile erişilebilir.
   * @param {string} datasetId
   * @param {Object} params - { format: "coco"|"yolo"|"visual_genome", version?: string }
   */
  downloadExport: async (datasetId, params) => {
    const queryParams = new URLSearchParams();
    if (params.format) queryParams.set('format', params.format);
    if (params.version) queryParams.set('version', params.version);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiService.get(`/datasets/${datasetId}/export${query}`);
    return response.data || response;
  }
};