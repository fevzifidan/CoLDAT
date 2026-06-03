// frontend/src/features/datasets/hooks/useDatasetImages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '@/shared/services/api/api.service';

/**
 * GET /datasets/{datasetId}/images endpoint'inden dönen Image tipi.
 * CoLDAT API Design'daki Image şemasına birebir uygun.
 */
export interface DatasetImage {
  asset_id: string;
  filename: string;
  mime_type: string;
  asset_url: string;
  asset_url_expiry_at: string;
  sam_embedding_url: string | null;
  sam_embedding_url_expiry_at: string | null;
  status: 'UPLOADED' | 'PENDING' | 'VERIFICATION_FAILED' | 'FAILED';
  embedding_status: 'UPLOADED' | 'PENDING' | 'VERIFICATION_FAILED' | 'FAILED' | null;
}

interface UseDatasetImagesOptions {
  search?: string;
  status?: string;
  limit?: number;
}

interface UseDatasetImagesReturn {
  images: DatasetImage[];
  loading: boolean;
  initialLoading: boolean;
  hasNext: boolean;
  loadMore: () => void;
  refresh: () => void;
  error: string | null;
}

/**
 * useDatasetImages — Dataset'teki görselleri cursor-based pagination ile getirir.
 *
 * API: GET /datasets/{datasetId}/images
 * Parametreler: search, status, limit, after (cursor)
 */
export function useDatasetImages(
  datasetId: string | undefined,
  options: UseDatasetImagesOptions = {}
): UseDatasetImagesReturn {
  const { search, status, limit = 50 } = options;

  const [images, setImages] = useState<DatasetImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const buildParams = useCallback(
    (cursor?: string | null) => {
      const params: Record<string, string | number> = { limit };
      if (cursor) params.after = cursor;
      if (search) params.search = search;
      if (status) params.status = status;
      return params;
    },
    [search, status, limit]
  );

  const fetchImages = useCallback(
    async (cursor?: string | null, append = false) => {
      if (!datasetId || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await apiService.get(
          `/datasets/${datasetId}/images`,
          { params: buildParams(cursor) }
        );

        const data: DatasetImage[] = response?.data ?? [];
        const nextCursor: string | null = response?.next_cursor ?? null;

        setImages((prev) => (append ? [...prev, ...data] : data));
        setHasNext(nextCursor !== null);
        nextCursorRef.current = nextCursor;
        setError(null);
      } catch (err: any) {
        if (!append) setImages([]);
        setError(
          err?.response?.data?.message ||
          'Failed to load dataset images.'
        );
      } finally {
        setLoading(false);
        loadingRef.current = false;
        setInitialLoading(false);
      }
    },
    [datasetId, buildParams]
  );

  // datasetId veya filtre değiştiğinde sıfırdan yükle
  useEffect(() => {
    if (!datasetId) {
      setImages([]);
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    setImages([]);
    nextCursorRef.current = null;
    fetchImages(null, false);
  }, [datasetId, fetchImages]);

  const loadMore = useCallback(() => {
    if (hasNext && !loading) {
      fetchImages(nextCursorRef.current, true);
    }
  }, [hasNext, loading, fetchImages]);

  const refresh = useCallback(() => {
    setImages([]);
    nextCursorRef.current = null;
    fetchImages(null, false);
  }, [fetchImages]);

  return {
    images,
    loading,
    initialLoading,
    hasNext,
    loadMore,
    refresh,
    error,
  };
}
