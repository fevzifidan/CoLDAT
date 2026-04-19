import { useState, useEffect, useCallback } from 'react';
import type { QueueImage } from '../../../types/annotation.types';
import apiService from '@/shared/services/api';

export function useImagePagination(taskId: string, limit: number = 50) {
    const [images, setImages] = useState<QueueImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchImages = useCallback(async (cursor: string | null) => {
        setLoading(true);
        try {
            const result: any = await apiService.get(`/tasks/${taskId}/images?limit=${limit}${cursor ? `&after=${cursor}` : ''}`)
            setImages(result.data || []);
            setNextCursor(result.next_cursor);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [taskId, limit]);

    useEffect(() => {
        fetchImages(null);
    }, [fetchImages]);

    const handleNext = () => {
        if (nextCursor) {
            setCursorHistory(prev => [...prev, nextCursor]);
            setCurrentPage(prev => prev + 1);
            fetchImages(nextCursor);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            const prevCursorIndex = currentPage - 2;
            const prevCursor = cursorHistory[prevCursorIndex];

            setCursorHistory(prev => prev.slice(0, -1));
            setCurrentPage(prev => prev - 1);
            fetchImages(prevCursor);
        }
    };

    return { images, loading, currentPage, hasNext: !!nextCursor, handleNext, handlePrevious };
}