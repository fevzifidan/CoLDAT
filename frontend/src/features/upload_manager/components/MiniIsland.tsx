import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronUp, X, CheckCircle2, AlertCircle, UploadCloud, Ban } from 'lucide-react';
import { useUploads } from '@/shared/services/s3upload/useUploads';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import { useAppStore } from '@/store';
import { getAggregateStatus, getVisibleTaskCount } from '../utils/aggregateStatus';

/**
 * Mini Island: Sayfanın sağ alt köşesinde görünen collapsed pill.
 * Tüm metinler i18n ile çevrilir.
 *
 * Davranış:
 * - Devam eden yükleme varsa → UploadCloud + "Uploading X files..."
 * - Tümü başarılı → CheckCircle2 + "All uploads complete"
 * - Tümü iptal edildi → Ban + "Uploads cancelled"
 * - Hata varsa → AlertCircle + "Upload failed" / "Uploads complete"
 * - Devam eden yükleme var → kapatma butonu gizli, sadece expand
 * - Tümü terminal durumda → expand + kapatma butonu görünür
 */
const MiniIsland: React.FC = () => {
  const { t } = useTranslation(['upload']);
  const tasks = useUploads();
  const {
    isExpanded,
    expandPanel,
    collapsePanel,
    allUploadsCompleted,
    setAllUploadsCompleted,
  } = useAppStore();

  const aggregate = React.useMemo(() => getAggregateStatus(tasks), [tasks]);
  const visibleTaskCount = getVisibleTaskCount(tasks);

  // allUploadsCompleted state'ini güncelle (saf hesaplama, state override YOK)
  React.useEffect(() => {
    if (visibleTaskCount === 0) {
      setAllUploadsCompleted(false);
      collapsePanel();
      return;
    }
    const newCompleted = !aggregate || aggregate.activeCount === 0;
    setAllUploadsCompleted(newCompleted);
  }, [visibleTaskCount, aggregate, setAllUploadsCompleted, collapsePanel]);

  // Hiç görünür task yoksa gizle
  if (!aggregate || visibleTaskCount === 0) return null;

  // Expanded durumda gizle (ExpandedPanel görünürken çakışmasın)
  if (isExpanded) return null;

  const isUploadingMode = aggregate.mode === 'uploading';
  const isAllSuccess = aggregate.mode === 'all_success';
  const isAllCancelled = aggregate.mode === 'all_cancelled';
  const isFailure = aggregate.mode === 'has_failure' || aggregate.mode === 'mixed';
  return (
    <AnimatePresence>
        <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-4 right-4 z-50"
        >
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-full shadow-lg shadow-black/10 dark:shadow-black/30">
          {/* Durum ikonu */}
          <div className="shrink-0">
            {isUploadingMode && (
              <UploadCloud className="w-5 h-5 text-blue-500 animate-pulse" />
              )}
            {isAllSuccess && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            {isAllCancelled && (
              <Ban className="w-5 h-5 text-gray-400" />
            )}
            {isFailure && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
              </div>

          {/* Durum metni */}
          <span className="text-sm font-medium text-foreground whitespace-nowrap select-none">
            {t(aggregate.i18nKey, aggregate.i18nOptions)}
          </span>

          {/* Aksiyon butonları */}
          <div className="flex items-center gap-1 ml-1">
            {/* Kapatma butonu — sadece tüm yüklemeler tamamlandıysa */}
            {allUploadsCompleted && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Tüm terminal durumdaki task'leri hidden yap → visibleTaskCount=0 olur
                  // useEffect otomatik olarak allUploadsCompleted=false + panel kapatır
                  uploadService.dismissAllCompleted();
                }}
                className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={t('upload:mini_island.close')}
                title={t('upload:mini_island.close')}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            {/* Expand butonu */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={expandPanel}
              className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={t('upload:mini_island.expand')}
              title={t('upload:mini_island.expand')}
            >
              <ChevronUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniIsland;

