import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUploads } from '@/shared/services/s3upload/useUploads';
import { uploadService } from '@/shared/services/s3upload/s3upload.service';
import { useAppStore } from '@/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, X, Pause, FileText } from 'lucide-react';
import FileItem from './FileItem';
import { getAggregateStatus, getVisibleTaskCount } from '../utils/aggregateStatus';

/**
 * Expanded Panel: Sağ tarafta full-height non-modal side drawer.
 * Arkaplanı karartmaz (overlay yok) — kullanıcı ana sayfa ile etkileşime devam edebilir.
 * tüm metinler i18n ile çevrilir.
 *
 * ÖNEMLİ (Route Değişimi Kararlılığı):
 * 1. UploadManager, App.tsx'te Suspense ve BrowserRouter DIŞINDA mount edilir.
 *    Böylece sayfa değişimlerinde veya Suspense fallback gösterildiğinde
 *    dahi DOM'dan kalkmaz, her zaman görünür kalır.
 * 2. AnimatePresence kullanılmaz çünkü exit animasyonu DOM'dan kaldırır.
 * 3. "return null" yerine translateX ile paneli ekrandan dışarı taşıma yapılır,
 *    böylece component her zaman React ağacında kalır, state/memo/subscription kaybetmez.
 *
 * Davranış:
 * - Başlık: "Uploads" + toplam dosya sayısı
 * - "Pause All" butonu: tüm aktif yüklemeleri iptal eder
 * - "Minimize" butonu: paneli kapatır (collapsePanel)
 * - "Close" butonu: sadece tüm yüklemeler tamamlandıysa görünür
 * - Dosya listesi: ScrollArea içinde FileItem listesi
 */
const ExpandedPanel: React.FC = () => {
  const { t } = useTranslation(['upload']);
  const tasks = useUploads();
  const {
    isExpanded,
    collapsePanel,
    allUploadsCompleted,
    setAllUploadsCompleted,
  } = useAppStore();

  const visibleTasks = React.useMemo(() => tasks.filter(t => !t.hidden), [tasks]);
  const aggregate = React.useMemo(() => getAggregateStatus(visibleTasks), [visibleTasks]);
  const totalCount = getVisibleTaskCount(visibleTasks);

  // allUploadsCompleted state'ini güncelle
  React.useEffect(() => {
    if (totalCount === 0) {
      setAllUploadsCompleted(false);
      collapsePanel();
      return;
    }
    const newCompleted = !aggregate || aggregate.activeCount === 0;
    setAllUploadsCompleted(newCompleted);
  }, [totalCount, aggregate, setAllUploadsCompleted, collapsePanel]);

  const handlePauseAll = () => {
    uploadService.cancelAll();
  };

  const handleMinimize = () => {
    collapsePanel();
  };

  // Close: Tüm terminal durumdaki task'leri hidden yap.
  // dismissAllCompleted() çağrılınca visibleTaskCount=0 olur,
  // useEffect state'i sıfırlar ve paneli kapatır.
  const handleClose = () => {
    uploadService.dismissAllCompleted();
  };

  return (
    <motion.div
      initial={false}
      animate={{
        x: isExpanded ? 0 : '100%',
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-y-0 right-0 z-[9998] w-96 sm:w-[400px] bg-background border-l border-border shadow-2xl flex flex-col ${!isExpanded ? 'pointer-events-none' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
        {/* Sol: Başlık + dosya sayısı */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-foreground">
            {t('upload:expanded_panel.title')}
          </h2>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold rounded-full bg-primary/10 text-primary tabular-nums">
            {totalCount}
          </span>
        </div>

        {/* Sağ: butonlar */}
        <div className="flex items-center gap-1">
          {/* Pause All — tüm aktif yüklemeleri durdur */}
          {aggregate && aggregate.activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handlePauseAll}
            >
              <Pause className="w-3.5 h-3.5 mr-1" />
              {t('upload:expanded_panel.pause_all')}
            </Button>
          )}

          {/* Minimize butonu */}
          <button
            onClick={handleMinimize}
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t('upload:expanded_panel.minimize')}
            title={t('upload:expanded_panel.minimize')}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Close butonu — sadece tüm yüklemeler tamamlandıysa */}
          {allUploadsCompleted && (
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={t('upload:expanded_panel.close')}
              title={t('upload:expanded_panel.close')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dosya listesi */}
      <div className="flex-1 min-h-0">
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <FileText className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">{t('upload:expanded_panel.empty')}</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-border/50">
              {visibleTasks.map((task) => (
                <FileItem key={task.upload_id} task={task} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </motion.div>
  );
};

export default ExpandedPanel;
