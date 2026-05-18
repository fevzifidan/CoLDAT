import { Loader2, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import type { UploadStatus } from '@/shared/services/s3upload/types';
import type { ComponentType } from 'react';

export interface StatusDisplayConfig {
  /** Status ikonu (Lucide component) */
  icon: ComponentType<{ className?: string }>;
  /** İkon ve etiketin Tailwind metin rengi */
  iconColorClass: string;
  /** Progress bar Tailwind arka plan rengi */
  progressBarColorClass: string;
  /** İnsan tarafından okunabilir durum için i18n key */
  statusI18nKey: string;
  /** Progress bar gösterilsin mi? */
  showProgress: boolean;
  /** İptal butonu gösterilsin mi? */
  showCancel: boolean;
  /** Retry butonu gösterilsin mi? */
  showRetry: boolean;
  /** Terminal durum mu? (başarı, hata, iptal) */
  isTerminal: boolean;
}

/**
 * Her UploadStatus için görüntüleme konfigürasyonu.
 * ⚠️ Hardcoded metin yok — tüm kullanıcıya gösterilen metinler i18n key'lerle
 * sağlanır. Gerçek çeviri FileItem/MiniIsland içindeki useTranslation() ile yapılır.
 *
 * Yeni bir status eklendiğinde:
 * 1. Buraya yeni bir entry ekle
 * 2. public/locales/{en,tr}/upload.json -> file_item.status kısmına çeviriyi ekle
 * 3. public/locales/{en,tr}/upload.json -> mini_island mesajlarını güncelle (opsiyonel)
 * Bileşen koduna dokunmaya gerek yok.
 */
export const STATUS_DISPLAY_CONFIG: Record<UploadStatus, StatusDisplayConfig> = {
  IDLE: {
    icon: Clock,
    iconColorClass: 'text-muted-foreground',
    progressBarColorClass: 'bg-muted-foreground',
    statusI18nKey: 'upload:file_item.status.idle',
    showProgress: false,
    showCancel: true,
    showRetry: false,
    isTerminal: false,
  },
  PREPROCESSING: {
    icon: Loader2,
    iconColorClass: 'text-blue-500',
    progressBarColorClass: 'bg-blue-500',
    statusI18nKey: 'upload:file_item.status.preprocessing',
    showProgress: true,
    showCancel: true,
    showRetry: false,
    isTerminal: false,
  },
  HASHING: {
    icon: Loader2,
    iconColorClass: 'text-blue-500',
    progressBarColorClass: 'bg-blue-500',
    statusI18nKey: 'upload:file_item.status.hashing',
    showProgress: true,
    showCancel: true,
    showRetry: false,
    isTerminal: false,
  },
  REQUESTING_URL: {
    icon: Loader2,
    iconColorClass: 'text-blue-500',
    progressBarColorClass: 'bg-blue-500',
    statusI18nKey: 'upload:file_item.status.requesting_url',
    showProgress: true,
    showCancel: true,
    showRetry: false,
    isTerminal: false,
  },
  UPLOADING: {
    icon: Loader2,
    iconColorClass: 'text-blue-500',
    progressBarColorClass: 'bg-blue-600',
    statusI18nKey: 'upload:file_item.status.uploading',
    showProgress: true,
    showCancel: true,
    showRetry: false,
    isTerminal: false,
  },
  SUCCESS: {
    icon: CheckCircle2,
    iconColorClass: 'text-green-500',
    progressBarColorClass: 'bg-green-500',
    statusI18nKey: 'upload:file_item.status.success',
    showProgress: false,
    showCancel: false,
    showRetry: false,
    isTerminal: true,
  },
  FAILED: {
    icon: AlertCircle,
    iconColorClass: 'text-red-500',
    progressBarColorClass: 'bg-red-500',
    statusI18nKey: 'upload:file_item.status.failed',
    showProgress: false,
    showCancel: false,
    showRetry: true,
    isTerminal: true,
  },
  CANCELLED: {
    icon: XCircle,
    iconColorClass: 'text-muted-foreground',
    progressBarColorClass: 'bg-muted-foreground',
    statusI18nKey: 'upload:file_item.status.cancelled',
    showProgress: false,
    showCancel: false,
    showRetry: false,
    isTerminal: true,
  },
};
