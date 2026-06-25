// frontend/src/features/datasets/components/ExportManager.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import notificationService from '@/shared/services/notification/notification.service';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileJson, 
  FileCode, 
  Archive, 
  CheckCircle2, 
  Loader2, 
  Key, 
  Trash2, 
  AlertOctagon,
  Copy,
  Check,
  Info
} from "lucide-react";
import { exportService } from '../services/exportService';

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

interface ExportManagerProps {
  datasetId?: string;
}

const ExportManager = ({ datasetId }: ExportManagerProps) => {
  const { t } = useTranslation(['pages', 'common', 'datasets']);
  
  // Format Seçim State'leri
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('coco');

    // API Keys State'leri
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    const formats = [
    { id: 'coco', name: 'COCO JSON', icon: FileJson, desc: t("datasets:export.formats.coco_desc", "COCO") },
    { id: 'yolo', name: 'YOLO v8', icon: FileCode, desc: t("datasets:export.formats.yolo_desc", "YOLO") },
    { id: 'visual_genome', name: 'Visual Genome', icon: Archive, desc: t("datasets:export.formats.visual_genome_desc", "Visual Genome") },
  ];

  // API Anahtarlarını Listele
  const loadApiKeys = async () => {
    if (!datasetId) return;
    setIsLoadingKeys(true);
    try {
      const res = await exportService.getApiKeys(datasetId);
      setApiKeys(res.data || res || []);
    } catch (err) {
      console.error(err);
      notificationService.error(t("datasets:export.notifications.load_keys_error", "Failed to retrieve integration keys."));
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, [datasetId]);

    // Yeni Anahtar Üret (POST)
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetId || !newKeyName.trim()) return;

    try {
      const payload = {
        name: newKeyName,
        ttl_days: 30, // Varsayılan 30 gün geçerlilik
        target_version: "v1.0"
      };
      const res = await notificationService.promise(
        exportService.createApiKey(datasetId, payload),
        {
                    loading: t("datasets:export.notifications.creating_key", "Generating secure access credentials..."),
          success: t("datasets:export.notifications.key_created", "API Key generated successfully!"),
          error: t("datasets:export.notifications.key_error", "Could not generate API access credentials."),
        }
      );
            setNewKeyName('');
      
      // Backend yeni oluşturulan raw_key'i sadece bu response'da döner
      if (res.raw_key) {
        notificationService.info(
          `API Key: ${res.raw_key}`,
          { duration: 120000 } // 2 dakika gösterim süresi
        );
      }
      
      loadApiKeys();
    } catch (err) {
      console.error(err);
    }
  };

    // Anahtarı Sil / İptal Et (DELETE)
  const handleDeleteKey = async (keyId: string) => {
    if (!datasetId) return;
    const confirmDelete = window.confirm(t("datasets:export.confirm_delete_key", "Are you sure you want to permanently delete this integration token?"));
    if (!confirmDelete) return;

    try {
      await exportService.deleteApiKey(datasetId, keyId);
      notificationService.success(t("datasets:export.notifications.key_deleted", "API Key revoked permanently."));
      loadApiKeys();
    } catch (err) {
      console.error(err);
      notificationService.error(t("datasets:export.notifications.key_delete_error", "Pipeline failure during key deletion."));
    }
  };

    // PANIC BUTTON: Tümünü Topluca Kapat (Revoke All)
  const handlePanicRevokeAll = async () => {
    if (!datasetId) return;
    const confirmPanic = window.confirm(t("datasets:export.confirm_revoke_all", "⚠️ WARNING: This will immediately revoke ALL active API keys for this dataset. External pipelines will break instantly. Proceed?"));
    if (!confirmPanic) return;

    try {
      await notificationService.promise(
        exportService.revokeAllKeys(datasetId),
        {
                    loading: t("datasets:export.notifications.revoking_all", "Executing global override revocation..."),
          success: t("datasets:export.notifications.revoke_success", "Security lockdown successful. All tokens invalidated."),
          error: t("datasets:export.notifications.revoke_error", "Override pipeline execution failed."),
        }
      );
      loadApiKeys();
    } catch (err) {
      console.error(err);
    }
  };

    // Panoya Kopyalama Fonksiyonu
  const handleCopyToClipboard = (keyId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    notificationService.success(t("datasets:export.notifications.key_copy", "Copied credentials to clipboard!"));
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

        // Export tetikleyicisi - backend'den gelen download_url ile indirme
  const handleExport = async () => {
    if (!datasetId) return;
    setIsExporting(true);
    try {
      const result = await notificationService.promise(
        exportService.downloadExport(datasetId, { format: selectedFormat }),
        {
          loading: `${selectedFormat.toUpperCase()} ${t("datasets:export.compiling", "Compiling...")}`,
          success: (data) => `${selectedFormat.toUpperCase()} ${t("datasets:export.notifications.export_complete", "export ready!")}`,
          error: t("datasets:export.notifications.export_error", "Export failed. Please try again."),
        }
      );
      
      // Backend'den gelen presigned download_url ile indirme başlat
      const downloadUrl = result?.download_url;
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${selectedFormat}-${result?.version_tag || 'latest'}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 📁 FORMAT SEÇİM ALANI */}
      <div className="space-y-4">
        <div className="text-left">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t("datasets:export.title", "Matrix Format Export Target")}</h3>
          <p className="text-xs text-muted-foreground">{t("datasets:export.description", "Transform native annotation polygons into specialized pipeline layers.")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formats.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;
            return (
              <Card 
                key={format.id}
                className={`cursor-pointer transition-all border rounded-2xl overflow-hidden shadow-xs ${
                  isSelected ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 dark:border-indigo-500' : 'hover:border-slate-300 dark:border-slate-800'
                }`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <CardContent className="p-5 flex flex-col items-center text-center justify-between h-full space-y-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{format.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 px-2 leading-relaxed">{format.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={14} className="text-indigo-600 dark:text-indigo-400" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-2xl border dark:border-slate-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("datasets:export.ready_title", "Static Snapshot Export Bundle")}</h4>
                <p className="text-[11px] text-muted-foreground">
                  {t("datasets:export.ready_desc", "Package current version matrix coordinates as: ")}  
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold ml-1">{selectedFormat === 'visual_genome' ? 'Visual Genome' : selectedFormat.toUpperCase()}</span>
                </p>
              </div>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 rounded-xl min-w-[140px] font-bold w-full sm:w-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> {t("datasets:export.compiling", "Compiling...")}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3.5 w-3.5" /> {t("datasets:export.pack_download", "Pack & Download")}
                  </>
                )}
              </Button>
            </div>
            {isExporting && (
              <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-pulse" style={{ width: '70%' }}></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <hr className="dark:border-slate-800" />

      {/* 🔑 API KEYS & AUTOMATION MANAGEMENT */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t("datasets:export.external_api", "External API Integrations")}</h3>
            <p className="text-xs text-muted-foreground">{t("datasets:export.api_description", "Automate cloud fetch processes using long-lived security signatures.")}</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handlePanicRevokeAll}
            disabled={apiKeys.length === 0}
            className="text-xs font-bold h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
          >
            <AlertOctagon size={14} className="mr-1.5" /> {t("datasets:export.emergency_revoke", "Emergency Revoke All")}
          </Button>
        </div>

        {/* Yeni Key Ekleme Formu */}
        <form onSubmit={handleCreateKey} className="flex gap-2 max-w-md">
          <Input 
            placeholder={t("datasets:export.placeholder_key_name", "e.g., Jenkins_CI_Pipeline, Production_Sync")}
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="h-8 text-xs rounded-xl dark:border-slate-800"
          />
          <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 h-8 font-bold text-xs rounded-xl whitespace-nowrap">
            <Key size={12} className="mr-1" /> {t("datasets:export.mint_token", "Mint API Token")}
          </Button>
        </form>

        {/* Anahtarlar Listesi Tablosu */}
        <Card className="rounded-2xl border dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {isLoadingKeys ? (
              <div className="flex justify-center items-center py-8 font-mono text-[11px] text-slate-400 gap-2">
                <Loader2 size={13} className="animate-spin" /> {t("datasets:export.decoding", "Decoding Signature Records...")}
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 font-mono text-[11px] text-slate-400">
                {t("datasets:export.no_keys", "No pipeline access integrations configured yet.")}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="p-3 pl-4">{t("datasets:export.table.token_identifier", "Token Identifier")}</th>
                    <th className="p-3">{t("datasets:export.table.secret_hash", "Secret Key Hash")}</th>
                    <th className="p-3">{t("datasets:export.table.expiry_date", "Expiry Date")}</th>
                    <th className="p-3">{t("datasets:export.table.status", "Status")}</th>
                    <th className="p-3 text-right pr-4">{t("datasets:export.table.scope_actions", "Scope Actions")}</th>
                  </tr>
                </thead>
                                <tbody className="divide-y dark:divide-slate-800 font-medium text-slate-600 dark:text-slate-300">
                  {apiKeys.map((key) => {
                    return (
                      <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="p-3 pl-4 font-bold text-slate-800 dark:text-slate-200">{key.name}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-tight">
                            <span className="text-slate-400">
                              {key.key_prefix}...
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(key.id, key.key_prefix)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600"
                              title={t("datasets:export.copy_prefix", "Copy key prefix")}
                            >
                              {copiedKeyId === key.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {new Date(key.expires_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge className={`text-[9px] uppercase font-bold border ${
                            key.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}>
                            {key.is_active ? t("datasets:export.active", "Active") : t("datasets:export.revoked", "Revoked")}
                          </Badge>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteKey(key.id)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 rounded-lg"
                            title={t("common:actions.delete", "Delete")}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExportManager;