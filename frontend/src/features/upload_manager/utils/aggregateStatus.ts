import type { UploadTask } from '@/shared/services/s3upload/types';

/** MiniIsland'ın görsel durum modu */
export type AggregateMode = 'uploading' | 'all_success' | 'all_cancelled' | 'has_failure' | 'mixed';

/** Upload Manager agregasyon sonucu */
export interface AggregateStatus {
  /** MiniIsland mesajı için i18n key */
  i18nKey: string;
  /** i18n interpolation parametreleri (örn: { count: 3 }) */
  i18nOptions?: Record<string, number | string>;
  /** Görsel durum modu */
  mode: AggregateMode;
  /** Kapatma butonu gösterilsin mi? */
  showClose: boolean;
  /** Devam eden aktif yükleme sayısı */
  activeCount: number;
  /** Hatalı yükleme sayısı */
  failedCount: number;
  /** Toplam görünür task sayısı */
  totalCount: number;
}

/**
 * Task dizisinden MiniIsland/ExpandedPanel için gerekli tüm
 * aggregate bilgileri hesaplar. Pure function: hiçbir UI bağımlılığı yoktur.
 * Döndürülen i18nKey'ler bileşenlerde useTranslation ile çevrilir.
 *
 * @param tasks - uploadService.subscribe()'den gelen task dizisi
 * @returns AggregateStatus | null (görünür task yoksa null)
 */
export function getAggregateStatus(tasks: UploadTask[]): AggregateStatus | null {
  const visible = tasks.filter(t => !t.hidden);
  if (visible.length === 0) return null;

  const totalCount = visible.length;
  const active = visible.filter(t => !['SUCCESS', 'FAILED', 'CANCELLED'].includes(t.status));
  const failed = visible.filter(t => t.status === 'FAILED');
  const succeeded = visible.filter(t => t.status === 'SUCCESS');

  const activeCount = active.length;
  const failedCount = failed.length;

  // Devam eden yüklemeler var
  if (activeCount > 0) {
    return {
      i18nKey: 'upload:mini_island.uploading',
      i18nOptions: { count: activeCount },
      mode: 'uploading',
      showClose: false,
      activeCount,
      failedCount,
      totalCount,
    };
  }

  const cancelled = visible.filter(t => t.status === 'CANCELLED');
  const cancelledCount = cancelled.length;

  // Tümü iptal edildi
  if (cancelledCount === totalCount) {
    return {
      i18nKey: 'upload:mini_island.all_cancelled',
      mode: 'all_cancelled',
      showClose: true,
      activeCount: 0,
      failedCount: 0,
      totalCount,
    };
  }

  // Tümü başarısız, başarılı yok
  if (failedCount > 0 && succeeded.length === 0) {
    return {
      i18nKey: 'upload:mini_island.upload_failed',
      mode: 'has_failure',
      showClose: true,
      activeCount: 0,
      failedCount,
      totalCount,
    };
  }

  // Tümü başarılı
  if (succeeded.length === totalCount) {
    return {
      i18nKey: 'upload:mini_island.all_complete',
      mode: 'all_success',
      showClose: true,
      activeCount: 0,
      failedCount: 0,
      totalCount,
    };
  }

  // Karışık: bazı başarılı, bazı hatalı, bazı iptal
  return {
    i18nKey: 'upload:mini_island.uploads_complete',
    mode: 'mixed',
    showClose: true,
    activeCount: 0,
    failedCount,
    totalCount,
  };
}

/**
 * Task dizisindeki toplam görünür dosya sayısını hesaplar.
 */
export function getVisibleTaskCount(tasks: UploadTask[]): number {
  return tasks.filter(t => !t.hidden).length;
}

/**
 * Yardımcı: Dosya boyutunu formatlar.
 * (Component'lerde kullanılmak üzere pure function)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

