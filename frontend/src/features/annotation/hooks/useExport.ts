/**
 * useExport.ts
 * 
 * Hook to handle annotation export logic using Web Workers.
 */
import { useCallback } from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import notificationService from '@/shared/services/notification';
import { downloadFile } from '@/shared/utils/downloadHelper';
import { useTranslation } from 'react-i18next';
import type { ExportData } from '@/shared/utils/exportConverters';

export function useExport() {
  const { t } = useTranslation('annotation');
  
  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const objectRelations = useAppStore(state => state.objectRelations);
  const imgDimensions = useAppStore(state => state.imgDimensions);
  const currentImage = useAppStore(state => state.currentImage);
  const taxonomy = useAppStore(state => state.taxonomy);
  
  const handleExport = useCallback((format: 'coco' | 'yolo' | 'visual_genome') => {
    if (!imgDimensions) {
      notificationService.error('Image not loaded yet.');
      return;
    }

    const exportData: ExportData = {
      objects: annotatedObjects,
      relations: objectRelations,
      imageName: currentImage?.filename || 'image',
      imageWidth: imgDimensions.width,
      imageHeight: imgDimensions.height,
      classNames: taxonomy.classes.map(c => c.name),
    };

    const exportPromise = new Promise<string>((resolve, reject) => {
      // Create worker
      const worker = new Worker(new URL('@/shared/workers/export.worker.ts', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };
      
      worker.postMessage({ data: exportData, format });
    });

    notificationService.promise(exportPromise, {
      loading: t('toolbar.exporting'),
      success: (result) => {
        const baseName = currentImage?.filename.split('.')[0] || 'export';
        const extensions = { coco: 'json', yolo: 'txt', visual_genome: 'json' };
        const mimeTypes = { coco: 'application/json', yolo: 'text/plain', visual_genome: 'application/json' };
        
        if (format === 'yolo') {
          // Download the .txt file for the image
          downloadFile(result, `${baseName}.txt`, 'text/plain');
          
          // Also download classes.txt using full project taxonomy for consistency
          const projectClasses = taxonomy.classes.map(c => c.name).join('\n');
          downloadFile(projectClasses, 'classes.txt', 'text/plain');
        } else {
          downloadFile(result, `${baseName}.${extensions[format]}`, mimeTypes[format]);
        }
        return t('toolbar.exportSuccess');
      },
      error: (err) => t('toolbar.exportError', { error: err.message || 'Unknown error' }),
    });
  }, [annotatedObjects, objectRelations, imgDimensions, t]);

  return { handleExport };
}
