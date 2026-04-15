// hooks/useUploads.ts
import { useEffect, useState } from 'react';
import { uploadService } from './s3upload.service';
import type { UploadTask } from './types';

export function useUploads() {
    // State'i harita (Map) olarak tutmak yerine diziye çevirerek dönmek 
    // React componentlerinde map() ile listelemeyi çok kolaylaştırır.
    const [tasks, setTasks] = useState<UploadTask[]>([]);

    useEffect(() => {
        // Servise abone ol (Her notify() çalıştığında bu callback tetiklenir)
        const unsubscribe = uploadService.subscribe((activeUploads) => {
            // Map'i Diziye çevirip state'e aktarıyoruz
            setTasks(Array.from(activeUploads.values()));
        });

        // Component unmount olduğunda aboneliği kaldır (Memory leak'i önler)
        return () => unsubscribe();
    }, []);

    return tasks;
}