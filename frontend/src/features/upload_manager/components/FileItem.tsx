import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';
import type { UploadTask } from '@/shared/services/s3upload/types';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import { STATUS_DISPLAY_CONFIG } from '../config/statusDisplayConfig';
import { getFileTypeIcon } from '../config/fileTypeIconConfig';
import { formatFileSize } from '../utils/aggregateStatus';

interface FileItemProps {
  task: UploadTask;
}

/**
 * Tekil yükleme öğesi bileşeni.
 * Config-driven: tüm görsel kararlar STATUS_DISPLAY_CONFIG'den alınır.
 * Yeni status eklendiğinde sadece config güncellenir, bu bileşen değişmez.
 */
const FileItem: React.FC<FileItemProps> = ({ task }) => {
  const { t } = useTranslation(['upload']);
  const config = STATUS_DISPLAY_CONFIG[task.status];
  const FileIcon = getFileTypeIcon(task.file.type);
  const StatusIcon = config.icon;
  const isSpinning = !config.isTerminal && config.showCancel;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="group flex items-start gap-3 px-5 py-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
    >
      {/* Dosya tipi ikonu */}
      <div className="mt-0.5 shrink-0">
        <FileIcon className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Orta kolon: dosya bilgisi + progress */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Üst satır: dosya adı + status ikonu + status etiketi */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">
            {task.file.name}
          </span>
          <StatusIcon
            className={`w-4 h-4 shrink-0 ${
              isSpinning ? 'animate-spin' : ''
            } ${config.iconColorClass}`}
          />
          <span className={`text-xs font-medium ${config.iconColorClass} shrink-0`}>
            {t(config.statusI18nKey)}
          </span>
        </div>

        {/* Alt satır: dosya boyutu */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatFileSize(task.file.size)}
          </span>
        </div>

        {/* Progress bar (sadece showProgress true ise) */}
        {config.showProgress && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${config.progressBarColorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
              {task.progress}%
            </span>
          </div>
        )}
      </div>

      {/* Sağ aksiyon butonları */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Retry butonu (sadece showRetry true ise) */}
        {config.showRetry && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
            onClick={() => uploadService.retryUpload(task.upload_id)}
            aria-label={t('upload:file_item.retry')}
            title={t('upload:file_item.retry')}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}

        {/* Cancel/İptal butonu (sadece showCancel true ise) */}
        {config.showCancel && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            onClick={() => uploadService.cancelUpload(task.upload_id)}
            aria-label={t('upload:file_item.cancel')}
            title={t('upload:file_item.cancel')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(FileItem);
