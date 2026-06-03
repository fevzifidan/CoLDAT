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
 * CoLDAT API Design'daki Image şemasına dayanır.
 */
export interface UserAsset {
  id: string;
  dataset_id: string;
  dataset_name?: string;
  filename: string;
  mime_type: string;
  width: number;
  height: number;
  file_size: number;
  status: string;
  created_at: string;
  updated_at?: string;
  thumbnail_url?: string;
}

export const assetService = {
  /**
   * GET /users/assets
   * Kullanıcının yüklediği tüm asset'leri cursor-based pagination ile listeler.
   * @param {Object} params - { status?, dataset_name?, dataset_id?, limit?, after? }
   */
  getUserAssets: async (params: {
    status?: string;
    dataset_name?: string;
    dataset_id?: string;
    limit?: number;
    after?: string | null;
  } = {}): Promise<{ data: UserAsset[]; next_cursor: string | null }> => {
    const response = await apiService.get('/users/assets', { params });
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
