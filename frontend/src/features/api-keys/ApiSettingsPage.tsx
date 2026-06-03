import { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiKeyService } from './services/apiKeyService';

export default function ApiSettingsPage() {
  const { t } = useTranslation('api-keys');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Sayfa ilk yüklendiğinde tarayıcıda kayıtlı bir anahtar varsa doğrudan yükle
  useEffect(() => {
    const savedKey = apiKeyService.getExternalKey();
    if (savedKey) {
      setApiKey(savedKey);
        setStatus('success');
    }
  }, []);

  const testConnection = async () => {
    setStatus('testing');

    // Simülasyon: Burada asıl API isteğini simüle ediyoruz
    setTimeout(() => {
      if (apiKey.startsWith('sk-')) { // Basit bir doğrulama kuralı
        setStatus('success');
        apiKeyService.saveExternalKey(apiKey); // Anahtarı servisin yerel metoduna kaydet
      } else {
        setStatus('error');
      }
    }, 1500);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-card rounded-2xl border border-border">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Key className="text-violet-500" /> {t('settings_page.title')}
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-muted-foreground">{t('settings_page.label')}</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={t('settings_page.input_placeholder')}
          className="w-full bg-background border border-border rounded-xl p-3 focus:border-violet-500 outline-none text-foreground"
        />
      </div>

      <button 
        onClick={testConnection}
        disabled={status === 'testing'}
        className="w-full bg-violet-600 hover:bg-violet-700 p-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-white disabled:opacity-50"
      >
        {status === 'testing' ? <Loader2 className="animate-spin" /> : t('settings_page.test_button')}
      </button>

      {/* Durum Mesajları */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center gap-2 border border-emerald-500/20">
          <CheckCircle size={20} /> {t('settings_page.success_message')}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 border border-destructive/20">
          <AlertCircle size={20} /> {t('settings_page.error_message')}
        </div>
      )}
    </div>
  );
}