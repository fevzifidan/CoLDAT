// src/services/mockAssetService.ts

export interface AssetUploadUrlResponse {
  assetId: string;
  uploadUrl: string;
  fileName: string;
}

export interface BulkUpdateResponse {
  success: boolean;
  updatedCount: number;
  message: string;
}

export const mockAssetService = {
  /**
   * Listede yarım denilen: POST /assets/upload-urls/{datasetId}/
   * Süreci simüle etmek için doğrudan objeleri return ediyoruz.
   */
  getUploadUrls: (datasetId: string, fileNames: string[]): Promise<AssetUploadUrlResponse[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Objeleri doğrudan parantez içinde () => ({ ... }) şeklinde dönerek 
        // "tanımlandı ama okunmadı" hatasının önüne geçiyoruz.
        const mockResponses: AssetUploadUrlResponse[] = fileNames.map((name, index) => ({
          assetId: `ast_${Math.random().toString(36).substring(2, 11)}`,
          uploadUrl: `https://coldat-storage.s3.amazonaws.com/datasets/${datasetId}/uploads/${Date.now()}_${index}`,
          fileName: name
        }));
        
        resolve(mockResponses);
      }, 800);
    });
  },

  /**
   * Listede yarım denilen: POST /assets/bulk-update-status/
   */
  bulkUpdateStatus: (assetIds: string[], status: 'accepted' | 'rejected'): Promise<BulkUpdateResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          updatedCount: assetIds.length,
          message: `${assetIds.length} adet görsel başarıyla '${status.toUpperCase()}' durumuna getirildi.`
        });
      }, 1200);
    });
  },

  /**
   * Listede yarım denilen: POST /assets/{assetId}/retry-upload/
   */
  retryUpload: (assetId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Retry upload triggered for: ${assetId}`); // assetId'yi burada okuyarak hatayı engelliyoruz
        resolve({ success: true });
      }, 1000);
    });
  }
};