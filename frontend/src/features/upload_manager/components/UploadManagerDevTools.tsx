import React, { useCallback } from 'react';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import { Button } from '@/components/ui/button';
import { Beaker, Bug } from 'lucide-react';

/**
 * Geliştirme araçları — sadece dev modunda görünür.
 * Mock veri ekleyerek UploadManager'ı test etmenizi sağlar.
 *
 * Kullanım: İmplementasyon dosyası (UploadManager.tsx) içinde
 * dev mod kontrolü ile import edilir.
 */

/** Rastgele dosya adı üret */
function randomFileName(index: number): string {
  const names = [
    'project_blueprint_v2',
    'annotation_export_2026',
    'dataset_sample_batch',
    'high_res_orthophoto',
    'training_data_merged',
    'validation_set_final',
    'segmentation_mask_v3',
    'raw_lidar_scan',
    'classification_results',
    'georeferenced_tiff',
  ];
  const extensions = ['.png', '.jpg', '.tiff', '.pdf', '.zip', '.json', '.csv'];
  const name = names[index % names.length];
  const ext = extensions[index % extensions.length];
  return `${name}${ext}`;
}

/** Rastgele MIME type */
function randomMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.tiff': 'image/tiff',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.json': 'application/json',
    '.csv': 'text/csv',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/** Rastgele dosya boyutu (50KB - 50MB arası) */
function randomFileSize(): number {
  return Math.floor(Math.random() * (50 * 1024 * 1024 - 50 * 1024) + 50 * 1024);
}

/**
 * Mock File objesi oluştur
 * addUpload'ın file parametresi için yeterli (File tipi mock'lamak zor)
 */
function createMockFile(name: string, size: number, mimeType: string): File {
  const blob = new Blob([new ArrayBuffer(size)], { type: mimeType });
  return new File([blob], name, { type: mimeType });
}

/**
 * Birden fazla mock task ekle
 */
function addMockUploads(count: number) {
  // Önce mock modu aktif et
  uploadService.setMockMode(true);

  for (let i = 0; i < count; i++) {
    const fileName = randomFileName(i);
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const mimeType = randomMimeType(ext);
    const fileSize = randomFileSize();
    const file = createMockFile(fileName, fileSize, mimeType);

    uploadService.addUpload(file, 'test-dataset-001', {
      priority: i % 5 === 0 ? 'HIGH' : 'LOW',
      upload_type: i % 5 === 0 ? 'embedding' : 'asset',
      asset_id: i % 5 === 0 ? `existing-asset-${i}` : undefined,
    });
  }
}

/**
 * Sadece 1 adet mock task ekle (hızlı test için)
 */
function addSingleMockUpload() {
  addMockUploads(1);
}

const UploadManagerDevTools: React.FC = () => {
  const handleAddSingle = useCallback(() => {
    addSingleMockUpload();
  }, []);

  const handleAddBatch = useCallback(() => {
    addMockUploads(5);
  }, []);

  // Dev mod değilse hiçbir şey gösterme
  // Vite import.meta.env.DEV sadece development modunda true olur.
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg">
        <Bug className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
          Dev Tools
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSingle}
            className="h-7 px-2 text-[11px] font-semibold bg-white dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/50"
          >
            <Beaker className="w-3 h-3 mr-1" />
            +1 Mock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddBatch}
            className="h-7 px-2 text-[11px] font-semibold bg-white dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/50"
          >
            <Beaker className="w-3 h-3 mr-1" />
            +5 Mock
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadManagerDevTools;

