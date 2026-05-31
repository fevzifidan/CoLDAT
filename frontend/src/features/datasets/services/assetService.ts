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

export const assetService = {
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
