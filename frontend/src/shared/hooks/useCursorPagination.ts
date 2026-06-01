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
  /**
   * Pagination mode:
   * - 'accumulate' (default): her loadMore() çağrısı mevcut listeye ekler (sonsuz scroll / "daha fazla yükle").
   *   `loadPage(null, true)` ile append yapılabilir.
   * - 'paginated': her sayfada sadece o sayfanın verisi gösterilir, goNext() / goPrev() ile gezilir.
   *   `loadPage(cursor, false)` her zaman replace yapar, cursor geçmişi otomatik yönetilir.
   */
  mode?: 'accumulate' | 'paginated';
}

export interface UseCursorPaginationReturn<T> {
  /** Toplanmış tüm item'lar (accumulate) veya sadece geçerli sayfadaki item'lar (paginated) */
  items: T[];
  /** Yükleme durumu */
  loading: boolean;
  /** Bir sonraki sayfa var mı? */
  hasNext: boolean;
  /** Bir önceki sayfa var mı? (Sadece mode='paginated' için anlamlı) */
  hasPrev: boolean;
  /** Bir sonraki sayfayı yükle (accumulate: append; paginated: replace) */
  loadMore: () => void;
  /** Herhangi bir hata mesajı */
  error: string | null;
  /** State'i sıfırla (örn. context değiştiğinde) */
  reset: () => void;
  /** Manuel olarak belirli bir cursor'dan sayfa yükle */
  loadPage: (cursor: string | null, append: boolean) => Promise<void>;
  /** İlk sayfa yükleniyor mu? */
  initialLoading: boolean;
  /** Geçerli sayfa numarası (1-tabanlı, sadece mode='paginated' için anlamlı) */
  currentPage: number;
  /** Sonraki sayfaya git (sadece mode='paginated' için anlamlı) */
  goNext: () => void;
  /** Önceki sayfaya git (sadece mode='paginated' için anlamlı) */
  goPrev: () => void;
}

/**
 * Cursor-based pagination için generic bir React hook.
 *
 * İki modda çalışır:
 *
 * **'accumulate' (default):**
 * Her `loadMore()` çağrısı mevcut listeye eklenir.
 * Sonsuz scroll veya "daha fazla yükle" butonu için uygundur.
 * ```tsx
 * const { items, loading, hasNext, loadMore } = useCursorPagination({
 *   fetchFn: async (cursor, limit) => 
 *     await projectService.getAllProjects({ limit, after: cursor }),
 *   limit: 10,
 * });
 * ```
 *
 * **'paginated':**
 * Her sayfa bağımsız gösterilir, `goNext()` / `goPrev()` ile gezilir.
 * Geri-ileri butonlu klasik sayfalama için uygundur.
 * ```tsx
 * const { items, loading, hasNext, hasPrev, currentPage, goNext, goPrev }
 *   = useCursorPagination({
 *     fetchFn: ...,
 *     limit: 50,
 *     mode: 'paginated',
 *   });
 * ```
 */
export function useCursorPagination<T>({
  fetchFn,
  limit = 10,
  enabled = true,
  manualFirstPage = false,
  mode = 'accumulate',
}: UseCursorPaginationOptions<T>): UseCursorPaginationReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const lastFetchId = useRef(0);
  const mountedRef = useRef(true);

  // --- Paginated modu state'leri ---
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);

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
  }, [enabled, manualFirstPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // loadMore: accumulate modunda append, paginated modunda goNext'e yönlendir
  const loadMore = useCallback(() => {
    if (mode === 'paginated') {
      if (nextCursor && !loading) {
        const nextPage = currentPage + 1;
        setCursorHistory(prev => [...prev, nextCursor]);
        setCurrentPage(nextPage);
        loadPage(nextCursor, false);
      }
      return;
    }

    // accumulate modu (mevcut davranış)
    if (nextCursor && !loading) {
      loadPage(nextCursor, true);
    }
  }, [mode, nextCursor, loading, currentPage, loadPage]);

  // goNext: sadece paginated modunda
  const goNext = useCallback(() => {
    if (mode !== 'paginated') return;
    loadMore();
  }, [mode, loadMore]);

  // goPrev: sadece paginated modunda
  const goPrev = useCallback(() => {
    if (mode !== 'paginated' || currentPage <= 1 || loading) return;

    // Cursor history stack'inden son cursor'u çıkar
    const newHistory = cursorHistory.slice(0, -1);
    const prevCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] ?? null : null;

    setCursorHistory(newHistory);
    setCurrentPage(currentPage - 1);
    loadPage(prevCursor, false);
  }, [mode, currentPage, loading, cursorHistory, loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setError(null);
    setLoading(false);
    setInitialLoading(false);

    // Paginated modu state'lerini de sıfırla
    if (mode === 'paginated') {
      setCursorHistory([null]);
      setCurrentPage(1);
    }

    lastFetchId.current++;
  }, [mode]);

  return {
    items,
    loading,
    hasNext: !!nextCursor,
    hasPrev: mode === 'paginated' ? currentPage > 1 : false,
    loadMore,
    error,
    reset,
    loadPage,
    initialLoading,
    currentPage: mode === 'paginated' ? currentPage : 1,
    goNext,
    goPrev,
  };
}
