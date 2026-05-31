import { useState, useEffect, useCallback, useRef } from 'react';

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
}

export interface UseCursorPaginationOptions<T> {
  fetchFn: (cursor: string | null, limit: number) => Promise<PaginatedResponse<T>>;
  limit?: number;
  /** Hook'un aktif olup olmadığını kontrol eder. false ise fetch çağrılmaz. */
  enabled?: boolean;
  /** immediate yerine loadMore() ile sayfalama yapılsın mı? */
  manualFirstPage?: boolean;
}

export interface UseCursorPaginationReturn<T> {
  /** Toplanmış tüm item'lar */
  items: T[];
  /** Yükleme durumu */
  loading: boolean;
  /** Bir sonraki sayfa var mı? */
  hasNext: boolean;
  /** Bir sonraki sayfayı yükle */
  loadMore: () => void;
  /** Herhangi bir hata mesajı */
  error: string | null;
  /** State'i sıfırla (örn. context değiştiğinde) */
  reset: () => void;
  /** Manuel olarak belirli bir cursor'dan sayfa yükle */
  loadPage: (cursor: string | null, append: boolean) => Promise<void>;
  /** İlk sayfa yükleniyor mu? */
  initialLoading: boolean;
}

/**
 * Cursor-based pagination için generic bir React hook.
 * 
 * Kullanım:
 * ```tsx
 * const { items, loading, hasNext, loadMore } = useCursorPagination({
 *   fetchFn: async (cursor, limit) => 
 *     await projectService.getAllProjects({ limit, after: cursor }),
 *   limit: 10,
 *   enabled: true,
 * });
 * ```
 */
export function useCursorPagination<T>({
  fetchFn,
  limit = 10,
  enabled = true,
  manualFirstPage = false,
}: UseCursorPaginationOptions<T>): UseCursorPaginationReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const lastFetchId = useRef(0);
  const mountedRef = useRef(true);

  // fetchFn referansını ref'te sakla ki her render'da değişmesin
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPage = useCallback(async (cursor: string | null, append: boolean) => {
    const fetchId = ++lastFetchId.current;

    if (!append) {
      setInitialLoading(true);
    }
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFnRef.current(cursor, limit);
      if (fetchId !== lastFetchId.current || !mountedRef.current) return;

      if (append) {
        setItems(prev => [...prev, ...result.data]);
      } else {
        setItems(result.data);
      }
      setNextCursor(result.next_cursor);
    } catch (err) {
      if (fetchId === lastFetchId.current && mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Veri yüklenemedi');
      }
    } finally {
      if (fetchId === lastFetchId.current && mountedRef.current) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [limit]);

  // İlk/sıfırlama yüklemesi
  useEffect(() => {
    if (!enabled || manualFirstPage) return;

    loadPage(null, false);

    return () => {
      // Cleanup: son fetch'i iptal et (race condition önleme)
      lastFetchId.current++;
    };
  }, [enabled, manualFirstPage]);

  const loadMore = useCallback(() => {
    if (nextCursor && !loading) {
      loadPage(nextCursor, true);
    }
  }, [nextCursor, loading, loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setError(null);
    setLoading(false);
    setInitialLoading(false);
    lastFetchId.current++;
  }, []);

  return {
    items,
    loading,
    hasNext: !!nextCursor,
    loadMore,
    error,
    reset,
    loadPage,
    initialLoading,
  };
}
