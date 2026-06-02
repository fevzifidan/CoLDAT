// src/features/datasets/components/DataSetExportCard.tsx
import { useState } from 'react';
import { Download, Loader2, CheckCircle2, Layers } from 'lucide-react';
import { toast } from 'sonner';

// Hata Çözümü: src/assets/services/ içindeki dosyaya giden doğru göreceli yol
import { mockExportService } from '../../../assets/services/mockExportService';

interface DataSetExportCardProps {
  datasetId?: string;
}

export default function DataSetExportCard({ datasetId = "default-dataset-123" }: DataSetExportCardProps) {
  const [format, setFormat] = useState<'coco' | 'yolo' | 'visual_genome'>('coco');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setDownloadUrl(null);
    try {
      const response = await mockExportService.exportDataset(datasetId, format);
      if (response.success && response.downloadUrl) {
        setDownloadUrl(response.downloadUrl);
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Dışa aktarma başarısız.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-md">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
        <Layers className="text-violet-500 w-5 h-5" /> Dataset Verisini Dışa Aktar
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Etiketlenmiş tüm görsellerinizi ve annotasyonlarınızı standart yapay zeka formatlarında indirin.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Hedef Format Seçin</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value as any)}
            disabled={isExporting}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
          >
            <option value="coco">COCO Format (.json)</option>
            <option value="yolo">YOLO Format (.zip / .txt)</option>
            <option value="visual_genome">Visual Genome (.json)</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Veriler Paketleniyor...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Dışa Aktarmayı Başlat
            </>
          )}
        </button>

        {downloadUrl && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={16} /> Dosyanız İndirmeye Hazır!
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); toast.info(`Simüle edilen indirme tetiklendi: ${downloadUrl}`); }}
              className="text-xs font-mono text-violet-600 dark:text-violet-400 underline truncate max-w-full"
            >
              export_file.zip
            </a>
          </div>
        )}
      </div>
    </div>
  );
}