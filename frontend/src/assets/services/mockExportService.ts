// src/services/mockExportService.ts

export interface ExportResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  taskId?: string;
}

export const mockExportService = {
  /**
   * Arkadaşının listesindeki endpoint: GET /datasets/{datasetId}/export/?format=coco|yolo|visual_genome
   * Gerçek backend akışını taklit etmek için asenkron Promise ve gecikme kullanıyoruz.
   */
  exportDataset: (datasetId: string, format: 'coco' | 'yolo' | 'visual_genome'): Promise<ExportResponse> => {
    return new Promise((resolve, reject) => {
      // Backend işleme süresini simüle etmek için 2 saniye gecikme
      setTimeout(() => {
        // Rastgele bir hata simülasyonu (Yüzde 5 ihtimalle hata fırlatabilir - test etmek için)
        if (Math.random() < 0.05) {
          reject(new Error("Dışa aktarma hattında beklenmeyen bir hata oluştu (Mock Error)."));
          return;
        }

        // Başarılı senaryo
        resolve({
          success: true,
          message: `Dataset başarıyla ${format.toUpperCase()} formatına dönüştürüldü.`,
          // İndirme linkini taklit ediyoruz
          downloadUrl: `https://api.coldat.local/v1/downloads/dataset_${datasetId}_export_${Date.now()}.${format === 'coco' ? 'json' : 'zip'}`
        });
      }, 2000);
    });
  }
};