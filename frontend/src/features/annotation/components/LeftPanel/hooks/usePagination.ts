import { useState, useEffect, useCallback, useRef } from 'react';
import type { TaskImage } from '../../../types/annotation.types';
import paginationStorage from '@/shared/services/storage';

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

export function useImagePagination(taskId: string, limit: number = 50) {
    const [images, setImages] = useState<TaskImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
    const [currentPage, setCurrentPage] = useState(1);

    // Race condition'ları engellemek için abort kontrolü
    const lastFetchId = useRef(0);

    /** Sayfa başlangıç index'ini hesaplar (0-tabanlı) */
    const getStartIndex = (page: number) => (page - 1) * limit;

    const fetchImages = useCallback(async (cursor: string | null, targetPage: number) => {
        if (!taskId) return;

        const fetchId = ++lastFetchId.current;
        setLoading(true);

        try {
            if (IS_TEST_MODE) {
                // ── Test modu: mock servisi kullan ─────────────────────────────
                const { getTaskImages } = await import('../../../services/annotation.api.mock');
                const result = await getTaskImages(taskId, limit, cursor);

                if (fetchId !== lastFetchId.current) return;

                setImages(result.data);
                setNextCursor(result.next_cursor);
            } else {
                // ── Production modu ────────────────────────────────────────────
                const startIndex = getStartIndex(targetPage);

                // Önce IndexedDB'de bu sayfanın verisi var mı diye bak
                const cached = await paginationStorage.getItemsByIndexRange<TaskImage>(
                    taskId, startIndex, limit
                );

                if (cached.length === limit || (cached.length > 0 && targetPage > 1)) {
                    // Cache hit — IndexedDB'den sun
                    if (fetchId !== lastFetchId.current) return;

                    setImages(cached.map(c => c.data as TaskImage));
                    // Context'teki en güncel cursor'ı al (bir sonraki sayfa için)
                    const savedCursor = await paginationStorage.getNextCursor(taskId);
                    setNextCursor(savedCursor);
                } else {
                    // Cache miss veya ilk sayfa (tazeleme gerekebilir) — API'ye git
                    const { getTaskImages } = await import('../../../services/annotation.api');
                    const result = await getTaskImages(taskId, limit, cursor);

                    if (fetchId !== lastFetchId.current) return;

                    // API'den gelen TaskImage verilerini IImages formatına (IndexedDB uyumlu) çevir
                    const itemsForStorage = result.data.map(img => ({
                        ...img,
                        id: img.asset_id,
                        task_id: taskId,
                        // String tarihleri timestamp (number) formatına çeviriyoruz
                        asset_url_expiry_at: new Date(img.asset_url_expiry_at).getTime(),
                        sam_embedding_url_expiry_at: img.sam_embedding_url_expiry_at
                            ? new Date(img.sam_embedding_url_expiry_at).getTime()
                            : undefined
                    }));

                    await paginationStorage.upsertPage(taskId, itemsForStorage, result.next_cursor, 'image');

                    setImages(result.data);
                    setNextCursor(result.next_cursor);
                }
            }
        } catch (error) {
            console.error('useImagePagination fetch error:', error);
        } finally {
            if (fetchId === lastFetchId.current) {
                setLoading(false);
            }
        }
    }, [taskId, limit]);

    useEffect(() => {
        setImages([]);
        setCurrentPage(1);
        setCursorHistory([null]);
        fetchImages(null, 1);
    }, [taskId, fetchImages]);

    const handleNext = () => {
        if (nextCursor && !loading) {
            const nextPage = currentPage + 1;
            setCursorHistory(prev => [...prev, nextCursor]);
            setCurrentPage(nextPage);
            fetchImages(nextCursor, nextPage);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1 && !loading) {
            const prevPage = currentPage - 1;
            const prevCursor = cursorHistory[prevPage - 1];

            setCursorHistory(prev => prev.slice(0, -1));
            setCurrentPage(prevPage);
            fetchImages(prevCursor, prevPage);
        }
    };

    return { images, loading, currentPage, hasNext: !!nextCursor, handleNext, handlePrevious };
}

