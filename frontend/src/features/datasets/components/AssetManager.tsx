// frontend/src/features/datasets/components/AssetManager.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import notificationService from '@/shared/services/notification/notification.service';
import { 
  CloudUpload, 
  RefreshCw, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetService } from '../services/assetService';

interface Asset {
  id: string;
  filename: string;
  size: string;
  status: 'PENDING' | 'UPLOADED' | 'FAILED' | 'VERIFICATION_FAILED';
  upload_url?: string;
  expiry_at?: string;
}

interface AssetManagerProps {
  projectId?: string;
}

const AssetManager = ({ projectId }: AssetManagerProps) => {
  const { t } = useTranslation(['pages', 'common', 'datasets']);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Proje id'sine göre asset listesini backend'den çekme fonksiyonu
const loadAssets = async () => {
  if (!projectId) {
    setIsLoading(false);
    return;
  }
  
  setIsLoading(true);
  try {
    // 🚨 GERÇEK BACKEND BAĞLANTISI YAPILANA KADAR BURAYI BOŞ ARRAY İLE SİMÜLE EDİYORUZ:
    // Eğer backend listen hazır olduğunda assetService.js'e listeleme endpoint'i eklersen:
    // const response = await assetService.getProjectAssets(projectId);
    // setAssets(response.data || []);
    
    setAssets([]); // Backend boş veya henüz yoksa şimdilik boş dizi set et
    } catch {
    setAssets([]); // Hata durumunda da arayüzün çökmesini engellemek için boş dizi ver
  } finally {
    // Buranın kesinlikle çalıştığından emin oluyoruz
    setIsLoading(false); 
  }
};

  useEffect(() => {
    loadAssets();
  }, [projectId]);

  /**
   * HANDLER 1: Toplu Durum Güncelleme (Bulk Status Update)
   * Seçili veya işlemdeki PENDING asset'lerin sonucunu havuz halinde gönderir.
   */
    const handleBulkUpdate = async () => {
    setIsProcessing(true);
    
    const pendingAssets = assets.filter(a => a.status === 'PENDING');
    if (pendingAssets.length === 0) {
      notificationService.error(t("datasets:assets.notifications.no_pending_assets", 'No pending assets found to update status.'));
      setIsProcessing(false);
      return;
    }

    const updates = pendingAssets.map(a => ({
      asset_id: a.id,
      upload_type: 'asset',
      success: true
    }));

    try {
      await notificationService.promise(
        assetService.bulkUpdateStatus(updates),
        {
          loading: t("datasets:assets.notifications.sending_batch", 'Sending batch upload status to backend...'),
          success: t("datasets:assets.notifications.batch_completed", 'Batch status synchronization completed!'),
          error: (err: any) =>
            err?.response?.data?.message || t("datasets:assets.notifications.batch_error", 'Failed to process bulk status update.'),
        }
      );
      
      setAssets(prev => prev.map(a => a.status === 'PENDING' ? { ...a, status: 'UPLOADED' } : a));
        } catch {
      // Error handled by notification service
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * HANDLER 2: Toplu URL Yenileme (Bulk Refresh Presigned URLs)
   * Süresi dolmak üzere olan PENDING kayıtların sürelerini uzatır.
   */
    const handleBulkRefreshUrls = async () => {
    setIsProcessing(true);
    
    const pendingIds = assets.filter(a => a.status === 'PENDING').map(a => a.id);
    if (pendingIds.length === 0) {
      notificationService.error(t("datasets:assets.notifications.no_pending_urls", 'No pending status assets require URL refresh.'));
      setIsProcessing(false);
      return;
    }

        try {
      await notificationService.promise(
        assetService.bulkRefreshUrls(pendingIds),
        {
                    loading: t("datasets:assets.notifications.refreshing_urls", 'Refreshing presigned URLs context...'),
          success: t("datasets:assets.notifications.urls_refreshed", `Successfully refreshed ${pendingIds.length} assets!`),
          error: t("datasets:assets.notifications.urls_error", 'Access denied or validation failed during URL refresh.'),
        }
      );
      loadAssets(); // Yenilenen expiry_at verilerini tekrar çekmek için listeyi tazele
        } catch {
      // Error handled by notification service
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * HANDLER 3: Askıda Kalanları Tarama (Check Dangling Status)
   * VERIFICATION_FAILED olanları S3'te var mı diye arkada zorla kontrol ettirir.
   */
    const handleCheckDangling = async () => {
    setIsProcessing(true);

                try {
      await notificationService.promise(
        assetService.checkDangling(),
        {
                    loading: t("datasets:assets.notifications.scanning_dangling", 'Scanning S3 repositories for dangling assets...'),
          success: (data: any) =>
            t("datasets:assets.notifications.scan_completed", `Scan completed. Synced to Uploaded: ${data?.updated_to_uploaded || 0}`),
          error: t("datasets:assets.notifications.scan_error", 'Dangling pointer sync pipeline failed.'),
        }
      );
      loadAssets(); // Durumlar güncellendiği için listeyi yeniden çek
        } catch {
      // Error handled by notification service
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * HANDLER 4: Başarısız Öğeyi Yeniden Canlandırma (Retry Single Failed Upload)
   */
    const handleRetrySingleUpload = async (assetId: string, filename: string) => {
    setIsProcessing(true);

    const retryPayload = {
      upload_id: assetId,
      upload_type: 'asset',
      asset_id: assetId,
      filename: filename,
      mime_type: 'image/jpeg',
      file_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      width: 1920,
      height: 1080
    };

    try {
      const res = await notificationService.promise(
        assetService.retryUpload(assetId, retryPayload),
        {
                    loading: t("datasets:assets.notifications.retrying_upload", `Re-initializing setup for ${filename}...`),
          success: t("datasets:assets.notifications.retry_success", 'New Presigned URL generated! Ready for S3 pipeline.'),
          error: t("datasets:assets.notifications.retry_error", 'Asset context is not eligible for a retry workflow.'),
        }
      );
      
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'PENDING', upload_url: res.url?.upload_url } : a));
        } catch {
      // Error handled by notification service
    } finally {
      setIsProcessing(false);
    }
  };

  // Badge Renk Eşleme Fonksiyonu
  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
            case 'UPLOADED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">{t("datasets:assets.status.annotated", "Annotated")}</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 animate-pulse">{t("datasets:assets.status.pending", "Pending")}</Badge>;
      case 'VERIFICATION_FAILED':
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900">{t("datasets:assets.status.verify_failed", "VERIFY_FAILED")}</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">{t("datasets:assets.status.upload_failed", "UPLOAD_FAILED")}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 font-mono text-xs text-slate-500 gap-2">
        <Loader2 size={16} className="animate-spin" /> {t('common:status.loading', 'Loading Pipeline State...')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🚀 ÜST PIPELINE KONTROL PANELİ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border dark:border-slate-800 shadow-sm bg-slate-50/40 dark:bg-slate-900/40">
          <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("datasets:assets.bulk_actions", "Bulk Actions")}</CardTitle>
            <CloudUpload size={16} className="text-indigo-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              size="sm" 
              onClick={handleBulkUpdate} 
              disabled={isProcessing || assets.filter(a => a.status === 'PENDING').length === 0}
              className="w-full text-xs h-8 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl"
            >
              {isProcessing && <Loader2 size={12} className="animate-spin mr-1" />} {t("datasets:assets.sync_pending", "Sync Pending Queue")}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border dark:border-slate-800 shadow-sm bg-slate-50/40 dark:bg-slate-900/40">
          <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("datasets:assets.url_lifetimes", "URL Lifetimes")}</CardTitle>
            <RefreshCw size={16} className="text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleBulkRefreshUrls} 
              disabled={isProcessing || assets.filter(a => a.status === 'PENDING').length === 0}
              className="w-full text-xs h-8 rounded-xl dark:border-slate-800"
            >
                            {t("datasets:assets.extend_links", "Extend Expiring Links")}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border dark:border-slate-800 shadow-sm bg-slate-50/40 dark:bg-slate-900/40">
          <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("datasets:assets.dangling_pointers", "Dangling Pointers")}</CardTitle>
            <AlertTriangle size={16} className="text-rose-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleCheckDangling} 
              disabled={isProcessing}
              className="w-full text-xs h-8 rounded-xl"
            >
              {t("datasets:assets.force_verification", "Force S3 Verification")}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border dark:border-slate-800 shadow-sm bg-slate-50/40 dark:bg-slate-900/40">
          <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("datasets:assets.queue_metrics", "Queue Metrics")}</CardTitle>
            <Activity size={16} className="text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between h-8 text-xs font-bold px-2 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500"/> {assets.filter(a=>a.status==='UPLOADED').length}</span>
            <span className="flex items-center gap-1"><Loader2 size={13} className="text-amber-500 animate-spin"/> {assets.filter(a=>a.status==='PENDING').length}</span>
            <span className="flex items-center gap-1"><XCircle size={13} className="text-rose-500"/> {assets.filter(a=>a.status==='FAILED' || a.status==='VERIFICATION_FAILED').length}</span>
          </CardContent>
        </Card>
      </div>

      {/* 🖼️ ASSETS GRID GÖRÜNÜMÜ */}
      <div className="flex justify-between items-center pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">{t("datasets:assets.matrix_items", "Dataset Matrix Items")}</h3>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-xl">
          + {t("datasets:assets.upload_items", "Upload Items")}
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center p-12 border border-dashed dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-mono">
          {t("datasets:assets.no_assets", "No assets found inside this project context.")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-950/50 aspect-video relative group border-b dark:border-slate-800">
                <ImageIcon size={32} className="text-slate-300 dark:text-slate-700 group-hover:scale-110 transition-transform" />
                
                {asset.status === 'FAILED' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleRetrySingleUpload(asset.id, asset.filename)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold h-7 rounded-lg"
                    >
                      {t("datasets:assets.retry_pipeline", "Retry Pipeline")}
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate text-left">
                    <h4 className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">{asset.filename}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{asset.size}</p>
                  </div>
                  {getStatusBadge(asset.status)}
                </div>
                
                {asset.status === 'PENDING' && asset.expiry_at && (
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 font-mono tracking-tight bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded-lg border border-amber-100/40 dark:border-amber-900/30">
                    {t("datasets:assets.expires_label", "Expires")}: {new Date(asset.expiry_at).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetManager;