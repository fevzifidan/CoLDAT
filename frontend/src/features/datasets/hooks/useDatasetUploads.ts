// frontend/src/features/datasets/hooks/useDatasetUploads.ts
import { useEffect, useState, useRef } from 'react';
import { uploadService } from '@/shared/services/s3upload';
import type { UploadTask } from '@/shared/services/s3upload/types';

/**
 * useDatasetUploads — Belirli bir dataset'e ait upload task'lerini dinler.
 *
 * uploadService.subscribe() yalnızca görünür (!hidden) task'leri listener'a iletir.
 * Bu nedenle hidden task'leri de yakalamak için getAllTasks() kullanarak
 * tüm task'leri alır ve dataset_id'ye göre filtreler.
 */
export function useDatasetUploads(datasetId: string) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const initializedRef = useRef(false);

  const refreshFromService = () => {
    const allTasks = uploadService.getAllTasks();
    const filtered = allTasks.filter(
      (t) => t.dataset_id === datasetId
    );
    setTasks(filtered.map((t) => ({ ...t })));
  };

  useEffect(() => {
    let mounted = true;

    const initAndSubscribe = async () => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        await uploadService.initialize();
      }

      const unsubscribe = uploadService.subscribe(() => {
        if (!mounted) return;
        refreshFromService();
      });

      if (mounted) {
        refreshFromService();
      }

      return unsubscribe;
    };

    const cleanupPromise = initAndSubscribe();

    return () => {
      mounted = false;
      cleanupPromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [datasetId]);

  return tasks;
}
