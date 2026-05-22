import { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiKeyService } from './services/apiKeyService';

export default function ApiSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Sayfa ilk yüklendiğinde tarayıcıda kayıtlı bir anahtar varsa doğrudan yükle
  useEffect(() => {
    const savedKey = apiKeyService.getExternalKey();
    if (savedKey) {
      setApiKey(savedKey);
      setStatus('success'); // Halihazırda geçerli bir anahtar yüklüyse success gösterilebilir
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
    <div className="p-8 max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 text-slate-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Key className="text-violet-500" /> API Ayarları
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-slate-400">OpenAI / Servis API Anahtarı</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 focus:border-violet-500 outline-none text-slate-100"
        />
      </div>

      <button 
        onClick={testConnection}
        disabled={status === 'testing'}
        className="w-full bg-violet-600 hover:bg-violet-700 p-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-white disabled:opacity-50"
      >
        {status === 'testing' ? <Loader2 className="animate-spin" /> : 'Anahtarı Test Et ve Kaydet'}
      </button>

      {/* Durum Mesajları */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-emerald-900/20 text-emerald-400 rounded-xl flex items-center gap-2 border border-emerald-500/20">
          <CheckCircle size={20} /> Anahtar başarıyla doğrulandı ve tarayıcıya kaydedildi!
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 p-4 bg-rose-900/20 text-rose-400 rounded-xl flex items-center gap-2 border border-rose-500/20">
          <AlertCircle size={20} /> Anahtar geçersiz, lütfen kontrol edin (sk- ile başlamalıdır).
        </div>
      )}
    </div>
  );
}