// frontend/src/features/synthetic/components/SyntheticStudioLayout.tsx

import { useState } from 'react';
import { useParams } from 'react-router-dom'; // URL'den datasetId'yi çekmek için
import ModelSelector from './ModelSelector';
import GenerationChat from './GenerationChat';
import ImageViewer from './ImageViewer';
import ImagePreviewStrip from './ImagePreviewStrip';
import { useSyntheticStore } from '../store/syntheticSlice';
import { useTranslation } from 'react-i18next';
import { Layers, Loader2, Database } from 'lucide-react';
import { assetService } from '../../datasets/services/assetService'; // Güncellediğimiz TS servis yolu

export default function SyntheticStudioLayout() {
  const { t } = useTranslation(['synthetic']);
  const { datasetId } = useParams<{ datasetId: string }>(); // URL'deki dataset ID'si
  const { selectedImageIds, images, bulkRemoveImages, deselectAllImages } = useSyntheticStore();
  
  const [isExporting, setIsExporting] = useState(false);

  const handleBulkDelete = () => {
    if (confirm(t('preview.bulkDeleteConfirm', { defaultValue: `${selectedImageIds.length} görseli stüdyodan kaldırmak istediğinize emin misiniz?` }))) {
      bulkRemoveImages(selectedImageIds);
      deselectAllImages();
    }
  };

  // Seçilen tüm sentetik verileri sırayla backend dataset'ine aktaran fonksiyon
  const handleBulkExportToDataset = async () => {
    if (!datasetId) {
      return;
    }

    setIsExporting(true);
    let successCount = 0;

    try {
      // Sadece seçili olan görsel nesnelerini store'dan filtrele
      const selectedImages = images.filter((img) => selectedImageIds.includes(img.id));

      for (const img of selectedImages) {
        try {
          const filename = `synthetic_${Date.now()}_${img.id.slice(-4)}.jpg`;
          
          // assetService üzerinden backend'e doğrudan sentetik kaydı pasla
          await assetService.createSyntheticAsset(datasetId, img.dataUrl, filename, img.prompt);
          successCount++;
        } catch (err) {
          console.error(`Görsel (${img.id}) dataset'e aktarılırken hata oluştu:`, err);
        }
      }      
      // Aktarılan görselleri stüdyonun geçici önbelleğinden temizle
      bulkRemoveImages(selectedImageIds);
      deselectAllImages();
    } catch (error) {
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-background border rounded-xl overflow-hidden shadow-sm">
      {/* 1. ÜST BAR: Model Seçimi ve Global Ayarlar */}
      <div className="h-14 border-b border-border bg-muted/40 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <span>Synthetic Studio</span>
          </div>
          <div className="w-px h-5 bg-border hidden sm:block" />
          <ModelSelector />
        </div>

        {/* Çoklu Seçim Yapıldığında Üst Barda Çıkan Toplu İşlem Paneli */}
        {selectedImageIds.length > 0 && (
          <div className="flex items-center gap-2 bg-accent/60 px-3 py-1 rounded-lg border border-accent animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-medium text-accent-foreground">
              {selectedImageIds.length} Seçili
            </span>
            
            {/* DATASET'E AKTAR BUTONU */}
            <button
              onClick={handleBulkExportToDataset}
              disabled={isExporting}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition font-medium"
            >
              {isExporting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Database className="w-3 h-3" />
              )}
              Dataset'e Aktar
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={isExporting}
              className="text-[11px] px-2 py-0.5 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 transition font-medium disabled:opacity-50"
            >
              Toplu Sil
            </button>
            
            <button
              onClick={deselectAllImages}
              disabled={isExporting}
              className="text-[11px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition disabled:opacity-50"
            >
              Temizle
            </button>
          </div>
        )}
      </div>

      {/* 2. ANA İÇERİK ALANI: Sol (Viewer), Orta (Dikey Preview Strip), Sağ (Generation Chat) */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        
        {/* BÜYÜK GÖRSEL ALANI (SOL PANEL) */}
        <div className="flex-1 min-w-0 h-full bg-background">
          <ImageViewer />
        </div>

        {/* DİKEY FİLM ŞERİDİ (ORTA İNCE PANEL) */}
        <div className="w-24 md:w-28 shrink-0 h-full border-l border-border">
          <ImagePreviewStrip />
        </div>

        {/* SOHBET VE PROMPT ALANI (SAĞ PANEL) */}
        <div className="w-[320px] md:w-[360px] shrink-0 h-full bg-background border-l border-border hidden sm:block">
          <GenerationChat />
        </div>

      </div>
    </div>
  );
}