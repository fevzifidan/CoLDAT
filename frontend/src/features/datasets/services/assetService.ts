import apiService from "@/shared/services/api/api.service";

interface BulkUpdateItem {
  asset_id: string;
  upload_type: string;
  success: boolean;
}

interface BulkUpdateResponse {
  message?: string;
  processed_count?: number;
}

interface RefreshUrlsResponse {
  refreshed_assets?: Array<{ asset_id: string; upload_url: string; expiry_at: string }>;
}

interface CheckDanglingResponse {
  processed_count?: number;
  updated_to_uploaded?: number;
  updated_to_failed?: number;
}

interface RetryUploadPayload {
  upload_id: string;
  upload_type: string;
  asset_id: string;
  filename: string;
  mime_type: string;
  file_sha256: string;
  width: number;
  height: number;
}

interface RetryUploadResponse {
  url?: {
    upload_url: string;
  };
}

/**
 * GET /users/assets endpoint'inden dönen asset tipi.
 * Backend AssetSerializer şemasına birebir uyumlu.
 * Not: Backend'de pagination, file_size, thumbnail_url, dataset_name alanları yoktur.
 */
export interface UserAsset {
  id: string;
  dataset_id: string;
  filename: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  status: string;
  created_at: string;
  updated_at?: string;
  /** Backend'de mevcut olmayan alanlar — null/undefined gelebilir */
  file_size?: number;
  thumbnail_url?: string;
  dataset_name?: string;
}

export const assetService = {
  /**
   * GET /users/assets
   * Kullanıcının yüklediği tüm asset'leri listeler.
   * Backend şu an cursor-based pagination DESTEKLEMEMEKTEDİR
   * (next_cursor her zaman null döner, tüm sonuçlar tek seferde gelir).
   *
   * @param {Object} params - { status?, search?, limit?, after? }
   *   - status: "PENDING" | "UPLOADED" | "FAILED" | "VERIFICATION_FAILED"
   *   - search: filename üzerinde arama (case-insensitive contains)
   */
  getUserAssets: async (params: {
    status?: string;
    search?: string;
    limit?: number;
    after?: string | null;
  } = {}): Promise<{ data: UserAsset[]; next_cursor: string | null }> => {
    const cleanParams: Record<string, any> = {};

    // Sadece backend'in anlayacağı parametreleri gönder
    if (params.status) cleanParams.status = params.status;
    if (params.search) cleanParams.search = params.search;

    // limit ve after backend tarafından ignore edilir (pagination yok),
    // ancak göndermek zararsızdır.
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
   */
  bulkUpdateStatus: async (updates: BulkUpdateItem[]): Promise<BulkUpdateResponse> => {
    const response = await apiService.post('/assets/bulk-update-status', { updates });
    return response.data || response;
  },

  /**
   * POST /assets/bulk-refresh-urls
   * Süresi dolan veya dolmak üzere olan PENDING durumundaki asset'lerin URL'lerini yeniler.
   */
  bulkRefreshUrls: async (assetIds: string[]): Promise<RefreshUrlsResponse> => {
    const response = await apiService.post('/assets/bulk-refresh-urls', { asset_ids: assetIds });
    return response.data || response;
  },

  /**
   * POST /assets/check-dangling
   * VERIFICATION_FAILED durumundaki askıda kalan S3 kayıtlarını manuel tetikleyerek kontrol eder.
   */
  checkDangling: async (): Promise<CheckDanglingResponse> => {
    const response = await apiService.post('/assets/check-dangling');
    return response.data || response;
  },

  /**
   * POST /assets/{asset_id}/retry-upload
   * FAILED durumuna düşmüş tekil bir asset yüklemesini yeni dosya metadatası ile canlandırır.
   */
  retryUpload: async (assetId: string, payload: RetryUploadPayload): Promise<RetryUploadResponse> => {
    const response = await apiService.post(`/assets/${assetId}/retry-upload`, payload);
    return response.data || response;
  }
};

