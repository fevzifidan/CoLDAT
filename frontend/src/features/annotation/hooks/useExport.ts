import { useCallback } from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import notificationService from '@/shared/services/notification';
import { downloadFile } from '@/shared/utils/downloadHelper';
import { useTranslation } from 'react-i18next';
import type { ExportData } from '@/shared/utils/exportConverters';
import JSZip from 'jszip';

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
      taxonomy,
    };

    const exportPromise = new Promise<Blob>(async (resolve, reject) => {
      // Create worker
      const worker = new Worker(new URL('@/shared/workers/export.worker.ts', import.meta.url), { type: 'module' });
      
      worker.onmessage = async (e) => {
        if (e.data.success) {
          try {
            const result = e.data.result;
            const zip = new JSZip();
            const baseName = currentImage?.filename.split('.')[0] || 'export';

            if (format === 'yolo') {
              // Add annotation file
              zip.file(`${baseName}.txt`, result);
              
              // Add classes.txt using project taxonomy (sorted by index)
              const projectClasses = [...taxonomy.classes]
                .sort((a, b) => a.index - b.index)
                .map(c => c.name)
                .join('\n');
              zip.file('classes.txt', projectClasses);
            } else if (format === 'coco') {
              zip.file(`${baseName}_coco.json`, result);
            } else if (format === 'visual_genome') {
              zip.file(`${baseName}_vg.json`, result);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            resolve(content);
          } catch (err) {
            reject(err);
          }
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
      success: (blob) => {
        const baseName = currentImage?.filename.split('.')[0] || 'export';
        downloadFile(blob, `${baseName}.zip`, 'application/zip');
        return t('toolbar.exportSuccess');
      },
      error: (err) => t('toolbar.exportError', { error: err.message || 'Unknown error' }),
    });
  }, [annotatedObjects, objectRelations, imgDimensions, taxonomy, currentImage, t]);

  return { handleExport };
}
