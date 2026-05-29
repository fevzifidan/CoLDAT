// src/features/synthetic/components/AssetBulkManager.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Check, X, Loader2, ImagePlus, RefreshCw } from 'lucide-react';
import notificationService from '@/shared/services/notification';

// Basit mock - production'da asset servisi kullanılacak
const mockAssetService = {
  getUploadUrls: async (_datasetId: string, _files: string[]) => ['https://mock.s3.upload.url/test'],
  bulkUpdateStatus: async (_assetIds: string[], _status: string) => ({ success: true, message: 'Mock update successful' }),
};

interface AssetBulkManagerProps {
  datasetId?: string;
}

export default function AssetBulkManager({ datasetId = "default-dataset-123" }: AssetBulkManagerProps) {
  const { t } = useTranslation(['synthetic']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles] = useState<string[]>(["gorsel_1.png", "gorsel_2.jpg", "gorsel_3.png"]);

  const handleBulkUploadSimulate = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    try {
      notificationService.info(t('bulkManager.toast.step1'));
      const uploadUrls = await mockAssetService.getUploadUrls(datasetId, selectedFiles);
      console.log("Mock URL'ler:", uploadUrls);

      notificationService.info(t('bulkManager.toast.step2'));
      notificationService.success(t('bulkManager.toast.success', { count: uploadUrls.length }));
    } catch (error) {
      notificationService.error(t('bulkManager.toast.uploadError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDecision = async (status: 'accepted' | 'rejected') => {
    setIsProcessing(true);
    try {
      const fakeAssetIds = ["ast_9123", "ast_4412", "ast_8812"];
      const response = await mockAssetService.bulkUpdateStatus(fakeAssetIds, status);
      
            if (response.success) {
        notificationService.success(t('bulkManager.toast.success', { count: fakeAssetIds.length }));
      }
    } catch (error) {
      notificationService.error(t('bulkManager.toast.updateError'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-md space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <ImagePlus className="text-blue-500 w-4 h-4" /> {t('bulkManager.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {t('bulkManager.filesList', { files: selectedFiles.join(', ') })}
        </p>
        <button
          onClick={handleBulkUploadSimulate}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {t('bulkManager.uploadButton')}
        </button>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <RefreshCw className="text-emerald-500 w-4 h-4" /> {t('bulkManager.actionsTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {t('bulkManager.actionsDesc')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkDecision('rejected')}
            disabled={isProcessing}
            className="flex-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <X size={14} /> {t('bulkManager.rejectAll')}
          </button>
          <button
            onClick={() => handleBulkDecision('accepted')}
            disabled={isProcessing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check size={14} /> {t('bulkManager.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}