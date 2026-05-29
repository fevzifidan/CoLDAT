// frontend/src/features/synthetic/components/ModelSelector.tsx

import { useState, useEffect, useRef } from 'react';
import { useSyntheticStore } from '../store/syntheticSlice';
import { imageGenerationService, PREDEFINED_MODELS } from '../services/imageGenerationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ExternalLink, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, apiKey, setApiKey, apiKeyVisible, toggleApiKeyVisibility, clearApiKey } = useSyntheticStore();

  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if apiKey was restored from localStorage
  const [isPersisted, setIsPersisted] = useState(false);
  useEffect(() => {
    // If key exists on mount without user typing, it's from localStorage
    if (apiKey && apiKey.trim().length >= 10) {
      setIsPersisted(true);
    }
  }, []); // only on mount

  const handleModelChange = (modelId: string) => {
    const model = imageGenerationService.getModelById(modelId);
    setSelectedModel(model ?? null);
    // Reset validation when model changes
    setValidationStatus('idle');
    setValidationMessage(null);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setIsPersisted(false);

    // Debounce validation (800ms after user stops typing)
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    if (!value || value.trim().length < 10) {
      setValidationStatus('idle');
      setValidationMessage(null);
      return;
    }

    setValidationStatus('validating');
    setValidationMessage(null);

    validationTimerRef.current = setTimeout(async () => {
      try {
        const result = await imageGenerationService.validateApiKey(value);
        if (result.valid) {
          setValidationStatus('valid');
          setValidationMessage('API anahtarı geçerli ✓');
        } else {
          setValidationStatus('invalid');
          setValidationMessage(result.message || 'API anahtarı geçersiz');
        }
      } catch {
        setValidationStatus('invalid');
        setValidationMessage('Validasyon sırasında hata oluştu');
      }
    }, 800);
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setValidationStatus('idle');
    setValidationMessage(null);
    setIsPersisted(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  const detectedProvider = apiKey ? imageGenerationService.detectProviderFromKey(apiKey) : null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Model Selection */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <Select value={selectedModel?.id ?? ''} onValueChange={handleModelChange}>
          <SelectTrigger className="w-[220px] h-9 text-xs bg-background border-border">
            <SelectValue placeholder="AI Model Seçin..." />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id} className="text-xs">
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Key Input (BYOK) with live validation */}
      {selectedModel?.requiresApiKey && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type={apiKeyVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder={`${selectedModel.name} API Anahtarı (${detectedProvider || 'sk-...'})`}
              className={`h-9 w-[320px] rounded-lg border bg-background px-3 pr-24 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                validationStatus === 'valid'
                  ? 'border-emerald-500 focus:ring-emerald-500'
                  : validationStatus === 'invalid'
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
              }`}
            />

            {/* Persisted badge */}
            {isPersisted && (
              <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-[8px] font-medium text-amber-700 dark:text-amber-400">
                Kayıtlı
              </div>
            )}

            {/* Validation indicator */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {validationStatus === 'validating' && (
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
              )}
              {validationStatus === 'valid' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
              {validationStatus === 'invalid' && (
                <XCircle className="w-3.5 h-3.5 text-destructive" />
              )}
            </div>

            {/* Visibility toggle */}
            <button
              onClick={toggleApiKeyVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-0.5"
              title={apiKeyVisible ? 'Gizle' : 'Göster'}
            >
              {apiKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>

            {/* Clear/Trash button */}
            {apiKey && (
              <button
                onClick={handleClearApiKey}
                className="absolute right-[22px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition p-0.5"
                title="API anahtarını sil (localStorage'dan da kaldırır)"
              >
                <Trash2 size={12} />
              </button>
            )}

            {/* Validation message tooltip */}
            {validationMessage && (
              <div
                className={`absolute -bottom-5 left-0 text-[9px] font-medium whitespace-nowrap ${
                  validationStatus === 'valid' ? 'text-emerald-500' : 'text-destructive'
                }`}
              >
                {validationMessage}
              </div>
            )}
          </div>
          {selectedModel.apiKeyUrl && (
            <a
              href={selectedModel.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Anahtar Al
            </a>
          )}
        </div>
      )}
    </div>
  );
}
