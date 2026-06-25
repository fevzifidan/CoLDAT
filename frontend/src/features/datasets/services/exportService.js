// frontend/src/features/datasets/services/exportService.js
import apiService from "@/shared/services/api/api.service";

export const exportService = {
  /**
   * GET /datasets/{datasetId}/api-keys
   * Dataset'e ait tüm API anahtarlarını listeler.
   */
  getApiKeys: async (datasetId) => {
    const response = await apiService.get(`/datasets/${datasetId}/api-keys`);
    // Interceptor response.data döndürür: { data: [...], next_cursor: null }
    return response;
  },

  /**
   * POST /datasets/{datasetId}/api-keys
   * Yeni bir API Anahtarı üretir.
   * @param {Object} payload - { name, ttl_days, target_version }
   */
  createApiKey: async (datasetId, payload) => {
    const response = await apiService.post(`/datasets/${datasetId}/api-keys`, payload);
    // Interceptor response.data döndürür: { id, dataset_id, ..., raw_key }
    return response;
  },

  /**
   * POST /datasets/{datasetId}/api-keys/actions/revoke-all
   * Acil durum: Tüm aktif anahtarları tek seferde iptal eder (Panic Button).
   */
  revokeAllKeys: async (datasetId) => {
    const response = await apiService.post(`/datasets/${datasetId}/api-keys/actions/revoke-all`);
    // Interceptor response.data döndürür: { revoked_count }
    return response;
  },

  /**
   * PATCH /datasets/{datasetId}/api-keys/{keyId}
   * Anahtar detaylarını günceller (isim, uzatma veya pasife çekme).
   */
  updateApiKey: async (datasetId, keyId, payload) => {
    const response = await apiService.patch(`/datasets/${datasetId}/api-keys/${keyId}`, payload);
    // Interceptor response.data döndürür: { id, dataset_id, ..., is_active }
    return response;
  },

  /**
   * DELETE /datasets/{datasetId}/api-keys/{keyId}
   * Bir API anahtarını kalıcı olarak siler.
   */
  deleteApiKey: async (datasetId, keyId) => {
    const response = await apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`);
    // Interceptor response.data döndürür (204 için null/empty olabilir)
    return response;
  },

    /**
   * GET /datasets/{datasetId}/api-keys/{keyId}/reveal
   * Maskelenmiş anahtarın orijinal halini gizli modda gösterir.
   */
  revealApiKey: async (datasetId, keyId) => {
    const response = await apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`);
    // Interceptor response.data döndürür: { id, dataset_id, ..., message }
    return response;
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
    // Interceptor response.data döndürür: { format, dataset_id, dataset_name, version_tag, download_url }
    return response;
  }
};