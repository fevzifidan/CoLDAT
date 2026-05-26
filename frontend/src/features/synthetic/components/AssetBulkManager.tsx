// src/features/synthetic/components/AssetBulkManager.tsx
import { useState } from 'react';
import { Upload, Check, X, Loader2, ImagePlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Hata Çözümü: src/assets/services/ içindeki dosyaya giden doğru göreceli yol
import { mockAssetService } from '../../datasets/services/mockAssetService';

interface AssetBulkManagerProps {
  datasetId?: string;
}

export default function AssetBulkManager({ datasetId = "default-dataset-123" }: AssetBulkManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles] = useState<string[]>(["gorsel_1.png", "gorsel_2.jpg", "gorsel_3.png"]);

  const handleBulkUploadSimulate = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    try {
      toast.info("1/2: Güvenli S3 yükleme adresleri alınıyor...");
      const uploadUrls = await mockAssetService.getUploadUrls(datasetId, selectedFiles);
      console.log("Mock URL'ler:", uploadUrls);

      toast.info("2/2: Dosyalar buluta aktarılıyor...");
      toast.success(`${uploadUrls.length} adet yeni görsel başarıyla sentetik havuzunuza yüklendi!`);
    } catch (error) {
      toast.error("Yükleme simülasyonunda hata oluştu.");
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
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Toplu durum güncelleme işlemi başarısız.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-md space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <ImagePlus className="text-blue-500 w-4 h-4" /> Toplu Görsel Yükleme Simülatörü
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Sıradaki dosyalar: <span className="font-mono text-violet-600 dark:text-violet-400">{selectedFiles.join(', ')}</span>
        </p>
        <button
          onClick={handleBulkUploadSimulate}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Güvenli URL Üzerinden Toplu Yükle (upload-urls)
        </button>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <RefreshCw className="text-emerald-500 w-4 h-4" /> Toplu Aksiyon İstekleri
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Seçili olan tüm resimleri tek seferde onayla veya reddet endpoint test alanı.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkDecision('rejected')}
            disabled={isProcessing}
            className="flex-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <X size={14} /> Tümünü Reddet
          </button>
          <button
            onClick={() => handleBulkDecision('accepted')}
            disabled={isProcessing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check size={14} /> Tümünü Onayla
          </button>
        </div>
      </div>
    </div>
  );
}