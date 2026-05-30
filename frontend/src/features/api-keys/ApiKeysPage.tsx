import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Eye, EyeOff, Trash2, Plus, Check, Copy, AlertCircle, RefreshCw, Cpu, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import notificationService from '@/shared/services/notification/notification.service';
// Projedeki güncel apiKeyService dosyasını bağlıyoruz
import { apiKeyService, type ApiKey } from './services/apiKeyService';

const ApiKeysPage = () => {
  const { t } = useTranslation(['api-keys', 'common']);
  const datasetId = "default-dataset-id"; 

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: string }>({});

  // Harici Sağlayıcı (Hoca Key'i) için eklenen state'ler
  const [externalKey, setExternalKey] = useState("");
  const [showExternalKey, setShowExternalKey] = useState(false);
  const [externalSaved, setExternalSaved] = useState(false);

  useEffect(() => {
    fetchApiKeys();
    // Sayfa açıldığında tarayıcıda kayıtlı hoca key'i varsa inputa yerleştir
    const savedExtKey = apiKeyService.getExternalKey();
    if (savedExtKey) {
      setExternalKey(savedExtKey);
      setExternalSaved(true);
    }
  }, []);

  const fetchApiKeys = () => {
    setLoading(true);
    apiKeyService.getApiKeys(datasetId)
      .then((data) => setApiKeys(data || []))
      .catch((error) => {
        console.error("API Key yükleme hatası:", error);
        notificationService.error(t("api-keys:messages.load_failed"));
      })
      .finally(() => setLoading(false));
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newKeyName.trim();
    if (!trimmedName) {
      notificationService.error(t("api-keys:messages.name_required"));
      return;
    }

    apiKeyService.createApiKey(datasetId, { name: trimmedName })
      .then((createdKey) => {
        // Yeni eklenen anahtarı en başa koyuyoruz
        setApiKeys(prev => [createdKey, ...prev]);
        setNewKeyName("");
        notificationService.success(t("api-keys:messages.created_success"));
        
        // Şemaya göre yeni oluşturulduğu an api_key string'i geliyorsa onu hemen görünür yapıyoruz
        if (createdKey.api_key) {
          setRevealedKeys(prev => ({ ...prev, [createdKey.id]: createdKey.api_key! }));
        }
      })
      .catch((error) => {
        console.error("Key oluşturma hatası:", error);
        notificationService.error(t("api-keys:messages.create_failed"));
      });
  };

  // Harici Key'i tarayıcıya kaydetme fonksiyonu
// Harici Key'i tarayıcıya kaydetme fonksiyonu (GERÇEK GÜVENLİK VE 40+ KARAKTER SINIRI)
const handleSaveExternalKey = (e: React.FormEvent) => {
  e.preventDefault();
  
  const trimmedKey = externalKey.trim();

  if (!trimmedKey) {
    notificationService.error(t("api-keys:messages.name_required"));
    return;
  }

  // KURAL: 'sk-' ile başlamalı VE toplam uzunluğu en az 40 karakter olmalı
  const isValidOpenAI = trimmedKey.startsWith("sk-") && trimmedKey.length >= 10;

  if (!isValidOpenAI) {
    notificationService.error(t("api-keys:messages.invalid_key"));
    return;
  }

  // Tüm şartlar sağlandıysa tarayıcı hafızasına kaydet
  apiKeyService.saveExternalKey(trimmedKey);
  setExternalSaved(true);
  notificationService.success(t("api-keys:messages.external_success_toast"));
};

  const handleClearExternalKey = () => {
    apiKeyService.clearExternalKey();
    setExternalKey("");
    setExternalSaved(false);
    notificationService.info(t("api-keys:messages.key_cleared"));
  };

  const handleToggleReveal = (keyId: string) => {
    // Eğer zaten çözülmüş ve görünür durumdaysa maskele (state'den sil)
    if (revealedKeys[keyId]) {
      setRevealedKeys(prev => {
        const copy = { ...prev };
        delete copy[keyId];
        return copy;
      });
      return;
    }

    // Görünür değilse servisten (veya fallback'ten) gerçek değerini iste
    apiKeyService.revealApiKey(datasetId, keyId)
      .then((data) => {
        if (data && data.api_key) { 
          setRevealedKeys(prev => ({ ...prev, [keyId]: data.api_key! }));
        } else {
          notificationService.error(t("api-keys:messages.reveal_failed"));
        }
      })
      .catch(() => {
        notificationService.error(t("api-keys:messages.reveal_failed"));
      });
  };

  const handleRevokeKey = (keyId: string) => {
    if (!confirm(t("api-keys:messages.confirm_revoke"))) {
      return;
    }

    apiKeyService.deleteApiKey(datasetId, keyId)
      .then(() => {
        setApiKeys(prev => prev.filter(k => k.id !== keyId));
        notificationService.success(t("api-keys:messages.revoked_success"));
      })
      .catch(() => {
        notificationService.error(t("api-keys:messages.revoke_failed"));
      });
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    notificationService.success(t("common:status.success_copied"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-muted-foreground min-h-screen">
        <Loader2 className="animate-spin text-indigo-600 mr-2 h-5 w-5" />
        {t("common:status.loading")}
      </div>
    );
  }

  return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Key className="text-primary h-8 w-8" /> {t('api-keys:page.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('api-keys:page.description')}
        </p>
      </div>

      {/* --- KART 1: HARİCİ YAPAY ZEKA SAĞLAYICI ALANI (Hoca Sunumu İçin) --- */}
      <Card className="bg-card border-2 border-dashed border-primary/40 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="text-violet-500 h-5 w-5" /> {t('api-keys:external_provider.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('api-keys:external_provider.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 flex gap-2.5 text-violet-700 dark:text-violet-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-violet-600 dark:text-violet-400" />
            <div>
              {t('api-keys:external_provider.privacy_notice')}
            </div>
          </div>

          <form onSubmit={handleSaveExternalKey} className="flex gap-3">
            <div className="relative flex-1">
              <Input 
                type={showExternalKey ? "text" : "password"}
                placeholder={t('api-keys:external_provider.input_placeholder')}
                value={externalKey}
                onChange={(e) => setExternalKey(e.target.value)}
                className="w-full bg-background border-border text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowExternalKey(!showExternalKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showExternalKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-medium">
              {externalSaved 
                ? t('api-keys:external_provider.btn_update') 
                : t('api-keys:external_provider.btn_connect')}
            </Button>
            {externalSaved && (
              <Button type="button" variant="outline" onClick={handleClearExternalKey} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                {t('api-keys:external_provider.btn_clear')}
              </Button>
            )}
          </form>
          {externalSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-fadeIn">
              <Check size={14} /> {t('api-keys:external_provider.success_message')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- KART 2: SİSTEM API GENERATE ALANI --- */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('api-keys:generate.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('api-keys:generate.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateKey} className="flex gap-4">
            <Input 
              placeholder={t('api-keys:generate.name_placeholder')}
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-background border-border text-foreground"
              maxLength={50}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium whitespace-nowrap">
              <Plus className="mr-1.5 h-4 w-4" /> {t('api-keys:generate.button')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-amber-700 dark:text-amber-400 text-sm">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
        <div>
          <span className="font-bold">{t('api-keys:security_warning.title')}</span>{' '}
          {t('api-keys:security_warning.message')}
        </div>
      </div>

      {/* --- KART 3: AKTİF ANAHTARLAR LİSTESİ --- */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-lg">{t('api-keys:key_list.title')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('api-keys:key_list.description')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchApiKeys} className="text-muted-foreground hover:bg-accent h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm italic">
              {t('api-keys:key_list.empty')}
            </div>
          ) : (
            apiKeys.map((key) => {
              const isRevealed = !!revealedKeys[key.id];
              const displayValue = isRevealed ? revealedKeys[key.id] : (key.api_key || "••••••••••••••••••••••••••••••••••••••••");

              return (
                <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-muted/30 gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-bold text-card-foreground text-sm">{key.name}</h4>
                    <div className="flex items-center gap-2 max-w-xl">
                      <code className="bg-background border border-border px-3 py-1.5 rounded-lg font-mono text-xs text-muted-foreground truncate flex-1 shadow-sm">
                        {displayValue}
                      </code>
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => handleToggleReveal(key.id)}>
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" disabled={!isRevealed} onClick={() => handleCopy(revealedKeys[key.id], key.id)}>
                        {copiedId === key.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRevokeKey(key.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10 shrink-0">
                    <Trash2 size={14} className="mr-2" /> {t('api-keys:key_list.revoke_button')}
                  </Button>
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