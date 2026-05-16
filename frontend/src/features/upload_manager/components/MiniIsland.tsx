import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronUp, X, CheckCircle2, AlertCircle, UploadCloud, Ban } from 'lucide-react';
import { useUploads } from '@/shared/services/s3upload/useUploads';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import { useAppStore } from '@/store';
import { getAggregateStatus, getVisibleTaskCount } from '../utils/aggregateStatus';
import { useShallow } from 'zustand/react/shallow';

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
 *
 * ÖNEMLİ (Route Değişimi Kararlılığı):
 * 1. UploadManager, App.tsx'te Suspense ve BrowserRouter DIŞINDA mount edilir.
 *    Böylece sayfa değişimlerinde veya Suspense fallback gösterildiğinde
 *    dahi DOM'dan kalkmaz, her zaman görünür kalır.
 * 2. AnimatePresence kullanılmaz çünkü exit animasyonu DOM'dan kaldırır.
 * 3. "return null" yerine opacity/pointer-events ile gizleme yapılır,
 *    böylece component her zaman React ağacında kalır, state kaybetmez.
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
  } = useAppStore(useShallow(state => ({
    isExpanded: state.isExpanded,
    expandPanel: state.expandPanel,
    collapsePanel: state.collapsePanel,
    allUploadsCompleted: state.allUploadsCompleted,
    setAllUploadsCompleted: state.setAllUploadsCompleted,
  })));

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

  // Görünürlük kontrolü:
  // - Hiç task yoksa → opacity-0 + pointer-events-none (DOM'da kalır)
  // - Expanded durumda → opacity-0 + pointer-events-none (çakışmasın)
  // Amaç: Her durumda DOM'da kalmak, state/memo/subscription kaybetmemek.
  const isHidden = !aggregate || visibleTaskCount === 0 || isExpanded;

  const isUploadingMode = aggregate?.mode === 'uploading';
  const isAllSuccess = aggregate?.mode === 'all_success';
  const isAllCancelled = aggregate?.mode === 'all_cancelled';
  const isFailure = aggregate?.mode === 'has_failure' || aggregate?.mode === 'mixed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: isHidden ? 0 : 1,
        y: isHidden ? 10 : 0,
        scale: isHidden ? 0.9 : 1,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`fixed bottom-4 right-4 z-[9999] ${isHidden ? 'pointer-events-none' : ''}`}
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
          {aggregate ? t(aggregate.i18nKey, aggregate.i18nOptions) : ''}
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
  );
};

export default MiniIsland;
