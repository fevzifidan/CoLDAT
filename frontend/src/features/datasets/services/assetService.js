// frontend/src/features/datasets/services/assetService.js
import apiService from "@/shared/services/api/api.service";

export const assetService = {
  /**
   * GET /users/assets
   * Kullanıcının yüklediği tüm asset'leri listeler.
   * Backend şu an cursor-based pagination desteklememektedir.
   * @param {Object} params - { status?, search?, limit?, after? }
   *   - status: "PENDING" | "UPLOADED" | "FAILED" | "VERIFICATION_FAILED"
   *   - search: filename üzerinde arama (case-insensitive contains)
   */
  getUserAssets: async (params = {}) => {
    // Sadece backend'in anlayacağı parametreleri temizle
    const cleanParams = {};
    if (params.status) cleanParams.status = params.status;
    if (params.search) cleanParams.search = params.search;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.after) cleanParams.after = params.after;
    const response = await apiService.get('/users/assets', { params: cleanParams });
    const data = response?.data ?? response ?? [];
    return {
      data: Array.isArray(data) ? data : [],
      next_cursor: response?.next_cursor ?? null,
    };
  },

  /**
   * POST /assets/bulk-update-status
   * İstemcide tamamlanan (başarılı/başarısız) yüklemeleri topluca backend'e bildirir.
   * @param {Array} updates - [{ asset_id: string, upload_type: string, success: boolean }]
   */
  bulkUpdateStatus: async (updates) => {
    const response = await apiService.post('/assets/bulk-update-status', { updates });
    return response.data || response;
  },

  /**
   * POST /assets/bulk-refresh-urls
   * Süresi dolan veya dolmak üzere olan PENDING durumundaki asset'lerin URL'lerini yeniler.
   * @param {Array<string>} assetIds - ["asset_id-1", "asset_id-2"]
   */
  bulkRefreshUrls: async (assetIds) => {
    const response = await apiService.post('/assets/bulk-refresh-urls', { asset_ids: assetIds });
    return response.data || response;
  },

  /**
   * POST /assets/check-dangling
   * VERIFICATION_FAILED durumundaki askıda kalan S3 kayıtlarını manuel tetikleyerek kontrol eder.
   */
  checkDangling: async () => {
    const response = await apiService.post('/assets/check-dangling');
    return response.data || response;
  },

  /**
   * POST /assets/{asset_id}/retry-upload
   * FAILED durumuna düşmüş tekil bir asset yüklemesini yeni dosya metadatası ile canlandırır.
   * @param {string} assetId - UUID formatında asset_id
   * @param {Object} payload - { upload_id, upload_type, asset_id, filename, mime_type, file_sha256, width, height }
   */
  retryUpload: async (assetId, payload) => {
    const response = await apiService.post(`/assets/${assetId}/retry-upload`, payload);
    return response.data || response;
  }
};