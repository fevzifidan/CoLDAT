// hooks/useUploads.ts
import { useEffect, useState, useRef } from 'react';
import { uploadService } from './s3upload.service';
import type { UploadTask } from './types';

export function useUploads() {
    // State'i harita (Map) olarak tutmak yerine diziye çevirerek dönmek 
    // React componentlerinde map() ile listelemeyi çok kolaylaştırır.
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const initializedRef = useRef(false);

    useEffect(() => {
        let mounted = true;

        const initAndSubscribe = async () => {
            // İlk mount'ta persistence'dan task'leri yükle
            if (!initializedRef.current) {
                initializedRef.current = true;
                await uploadService.initialize();
            }

        // Servise abone ol (Her notify() çalıştığında bu callback tetiklenir)
        const unsubscribe = uploadService.subscribe((activeUploads) => {
                if (!mounted) return;
            // Her task için yeni referans oluştur, böylece React.memo doğru çalışır.
            // Ayrıca sadece status/progress gibi UI için gerekli alanları spread et.
            const clonedTasks = Array.from(activeUploads.values()).map(task => ({
                ...task,
            }));
            setTasks(clonedTasks);
        });

            // Eğer initialize sonrası task varsa, hemen aboneyi tetikle
            // (subscribe henüz notify çağırmadı, UI boş görebilir)
            const allTasks = uploadService.getAllTasks();
            if (allTasks.length > 0 && mounted) {
                const clonedTasks = allTasks.map(task => ({ ...task }));
                setTasks(clonedTasks);
            }

        // Component unmount olduğunda aboneliği kaldır (Memory leak'i önler)
            return unsubscribe;
        };

        const cleanupPromise = initAndSubscribe();

        return () => {
            mounted = false;
            cleanupPromise.then(unsubscribe => {
                if (unsubscribe) unsubscribe();
            });
        };
    }, []);

    return tasks;
}