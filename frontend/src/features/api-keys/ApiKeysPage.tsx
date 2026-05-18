// src/features/api-keys/ApiKeysPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Eye, EyeOff, Trash2, Plus, Check, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import { apiKeyService, type ApiKey } from './services/apiKeyService';

const ApiKeysPage = () => {
  const { t } = useTranslation();
  const datasetId = "default-dataset-id"; 

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = () => {
    setLoading(true);
    apiKeyService.getApiKeys(datasetId)
      .then((data) => setApiKeys(data || []))
      .catch((error) => {
        console.error("API Key yükleme hatası:", error);
        toast.error(t("apiService:error.unexpected_err", "API anahtarları yüklenemedi."));
      })
      .finally(() => setLoading(false));
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newKeyName.trim();
    if (!trimmedName) return;

    apiKeyService.createApiKey(datasetId, { name: trimmedName })
      .then((createdKey) => {
        setApiKeys(prev => [createdKey, ...prev]);
        setNewKeyName("");
        toast.success(t("apikeys.created_success", "Yeni API anahtarı başarıyla oluşturuldu."));
        
        if (createdKey.api_key) {
          setRevealedKeys(prev => ({ ...prev, [createdKey.id]: createdKey.api_key! }));
        }
      })
      .catch((error) => {
        console.error("Key oluşturma hatası:", error);
        toast.error(t("apikeys.create_failed", "Anahtar oluşturulurken bir hata meydana geldi."));
      });
  };

  const handleToggleReveal = (keyId: string) => {
    if (revealedKeys[keyId]) {
      setRevealedKeys(prev => {
        const copy = { ...prev };
        delete copy[keyId];
        return copy;
      });
      return;
    }

    apiKeyService.revealApiKey(datasetId, keyId)
      .then((data) => {
        if (data.api_key) {
          setRevealedKeys(prev => ({ ...prev, [keyId]: data.api_key! }));
        }
      })
      .catch((error) => {
        console.error("Key reveal hatası:", error);
        toast.error(t("apikeys.reveal_failed", "Anahtar doğrulaması başarısız oldu."));
      });
  };

  const handleRevokeKey = (keyId: string) => {
    if (!confirm(t("apikeys.confirm_revoke", "Bu API anahtarını iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz."))) {
      return;
    }

    apiKeyService.deleteApiKey(datasetId, keyId)
      .then(() => {
        setApiKeys(prev => prev.filter(k => k.id !== keyId));
        toast.success(t("apikeys.revoked_success", "API anahtarı kalıcı olarak iptal edildi."));
      })
      .catch((error) => {
        console.error("Key silme hatası:", error);
        toast.error(t("apikeys.revoke_failed", "Anahtar iptal edilirken bir API hatası oluştu."));
      });
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(t("common.copied", "Panoya kopyalandı!"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground bg-slate-50/50 min-h-screen">
        {t("common.loading", "API anahtarları yükleniyor...")}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto bg-slate-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Key className="text-indigo-600 h-8 w-8" /> {t('apikeys.title', 'Integration API Keys')}
        </h1>
        <p className="text-slate-500 mt-1">
          {t('apikeys.description', 'Manage secret keys to access your datasets securely from external applications or SDKs.')}
        </p>
      </div>

      <Card className="bg-white border-2">
        <CardHeader>
          <CardTitle className="text-lg">{t('apikeys.generate_title', 'Create New Token')}</CardTitle>
          <CardDescription>{t('apikeys.generate_desc', 'Give your key a descriptive name to remember where it is used.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateKey} className="flex gap-4">
            <Input 
              placeholder="e.g., Python SDK Production, Jenkins CI"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-white"
              maxLength={50}
            />
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-medium whitespace-nowrap">
              <Plus className="mr-1.5 h-4 w-4" /> {t('apikeys.generate_btn', 'Generate Key')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-bold">{t('common.warning', 'Security Warning:')}</span>{' '}
          {t('apikeys.security_notice', 'Do not share your API keys in public repositories or client-side code. Anyone with this key can modify your dataset configurations.')}
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('apikeys.list_title', 'Active API Keys')}</CardTitle>
            <CardDescription>{t('apikeys.list_desc', 'Tokens currently authorized to make requests under this account.')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchApiKeys} className="text-slate-500">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              {t('apikeys.empty_list', 'No API keys generated yet.')}
            </div>
          ) : (
            apiKeys.map((key) => {
              const isRevealed = !!revealedKeys[key.id];
              const displayValue = isRevealed ? revealedKeys[key.id] : "••••••••••••••••••••••••••••••••••••••••";

              return (
                <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {key.name}
                      {!key.is_active && (
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-normal">Inactive</span>
                      )}
                    </h4>
                    
                    <div className="flex items-center gap-2 max-w-xl">
                      <code className="bg-white border px-3 py-1.5 rounded-lg font-mono text-xs text-slate-600 select-all block truncate flex-1 shadow-sm">
                        {displayValue}
                      </code>
                      
                      <Button 
                        size="icon" variant="outline" className="h-8 w-8 shrink-0"
                        onClick={() => handleToggleReveal(key.id)}
                        title={isRevealed ? "Hide Key" : "Reveal Key"}
                      >
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>

                      <Button 
                        size="icon" variant="outline" className="h-8 w-8 shrink-0"
                        disabled={!isRevealed}
                        onClick={() => handleCopy(revealedKeys[key.id], key.id)}
                        title="Copy to Clipboard"
                      >
                        {copiedId === key.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </Button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Created on: {key.created_at ? new Date(key.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <Button 
                      variant="outline" size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                      className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold gap-1.5 h-9"
                    >
                      <Trash2 size={14} /> {t('apikeys.revoke_btn', 'Revoke Key')}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysPage;