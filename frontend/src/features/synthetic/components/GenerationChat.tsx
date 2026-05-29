import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSyntheticStore } from '../store/syntheticSlice';
import { imageGenerationService } from '../services/imageGenerationService';
import { generateThumbnail } from '@/shared/utils/imageUtils';
import { Bot, User, Send, Loader2 } from 'lucide-react';
// Using plain overflow div instead of Radix ScrollArea to avoid layout thrash during resize

/**
 * Renders a chat message using either raw text, or i18n key + params.
 */
function renderMessageText(msg: { text?: string; i18nKey?: string; i18nParams?: Record<string, string | number | boolean> }, t: (key: string, params?: object) => string): string {
  if (msg.i18nKey && t) {
    return t(msg.i18nKey, msg.i18nParams as Record<string, string | number | boolean>);
  }
  return msg.text || '';
}

function ChatInputArea() {
  const { t } = useTranslation(['synthetic', 'common']);
  const {
    addMessage,
    selectedModel,
    apiKey,
    isGenerating,
    setIsGenerating,
    setGenerationError,
    addImage,
    zoom,
    filters,
    setZoom,
    setRotation,
    updateFilters,
    resetViewer,
  } = useSyntheticStore();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input after generation completes
  useEffect(() => {
    if (!isGenerating) {
      inputRef.current?.focus();
    }
  }, [isGenerating]);

  const handleCommand = (text: string): boolean => {
    const lower = text.toLowerCase();

    if (/sıfırla|temizle|reset|clear|orijinal/.test(lower)) {
      resetViewer();
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.commands.reset',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/döndür|çevir|rotate/.test(lower)) {
      const degreeMatch = text.match(/(-?\d+)/);
      const deg = degreeMatch ? parseInt(degreeMatch[1], 10) : 90;
      setRotation(deg);
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.commands.rotate',
        i18nParams: { degree: deg },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/zoom in|yakınlaş|büyüt|enlarge/.test(lower)) {
      const newZoom = zoom + 0.3;
      setZoom(newZoom);
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.commands.zoomIn',
        i18nParams: { zoom: parseFloat(newZoom.toFixed(1)) },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/zoom out|uzaklaş|küçült|shrink/.test(lower)) {
      const newZoom = zoom - 0.3;
      setZoom(newZoom);
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.commands.zoomOut',
        i18nParams: { zoom: parseFloat(newZoom.toFixed(1)) },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/invert|ters/.test(lower)) {
      const wasInverted = filters.invert;
      updateFilters({ invert: !wasInverted });
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: wasInverted ? 'synthetic:chat.commands.invert_off' : 'synthetic:chat.commands.invert_on',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/gri|grayscale|siyah.beyaz|monochrome/.test(lower)) {
      updateFilters({ grayscale: true, sepia: false });
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.commands.grayscale',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/sepya|sepia/.test(lower)) {
      updateFilters({ sepia: true, grayscale: false });
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.commands.sepia',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    if (/blur|bulanık/.test(lower)) {
      const newBlur = filters.blur === 0 ? 4 : 0;
      updateFilters({ blur: newBlur });
      addMessage({
        id: `cmd_${Date.now()}`,
        sender: 'ai',
        i18nKey: newBlur > 0 ? 'synthetic:chat.commands.blur_on' : 'synthetic:chat.commands.blur_off',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return true;
    }

    return false;
  };

  const handleGenerate = async () => {
    const prompt = inputValue.trim();
    if (!prompt || isGenerating) return;
    setInputValue('');

    // Check for command keywords first
    if (handleCommand(prompt)) return;

    // Guard: API key check
    if (!selectedModel) {
      addMessage({
        id: `err_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.errors.noModel',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

    if (!apiKey || apiKey.trim().length < 10) {
      addMessage({
        id: `err_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.errors.noApiKey',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

    // Add user message
    addMessage({
      id: `user_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Start generation
    setIsGenerating(true);
    setGenerationError(null);

    const generatingMsgId = `gen_${Date.now()}`;
    addMessage({
      id: generatingMsgId,
      sender: 'ai',
      i18nKey: 'synthetic:chat.generatingFor',
      i18nParams: { prompt, model: selectedModel.name },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Retry mechanism with exponential backoff
    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const generated = await imageGenerationService.generateImage(selectedModel, prompt, apiKey);

        // Generate thumbnail for preview strip
        try {
          generated.thumbnailUrl = await generateThumbnail(generated.dataUrl);
        } catch {
          // Silently fail, thumbnail not critical
        }

        addImage(generated);
        resetViewer();

        addMessage({
          id: `done_${Date.now()}`,
          sender: 'ai',
          i18nKey: 'synthetic:chat.generationSuccess',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        lastError = undefined;
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;

        if (attempt < MAX_RETRIES) {
          const waitMs = 1500 * attempt; // Exponential: 1.5s, 3s
          addMessage({
            id: `retry_${Date.now()}_${attempt}`,
            sender: 'ai',
            i18nKey: 'synthetic:chat.retrying',
            i18nParams: { attempt, wait: waitMs / 1000 },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
    }

    if (lastError) {
      const errMsg = lastError instanceof Error ? lastError.message : t('chat.errors.unknownError');
      setGenerationError(errMsg);
      addMessage({
        id: `err_${Date.now()}`,
        sender: 'ai',
        i18nKey: 'synthetic:chat.errors.generationFailed',
        i18nParams: { retries: MAX_RETRIES, message: errMsg },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const placeholder = isGenerating
    ? t('chat.inputPlaceholder_generating')
    : selectedModel
      ? t('chat.inputPlaceholder_ready')
      : t('chat.inputPlaceholder_noModel');

  return (
    <div className="shrink-0 p-3 border-t border-border bg-muted/20">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          placeholder={placeholder}
          className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !inputValue.trim() || !selectedModel}
          className="h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {t('chat.sendButton')}
        </button>
      </div>
    </div>
  );
}

export default function GenerationChat() {
  const { t } = useTranslation(['synthetic', 'common']);
  const { messages, isGenerating } = useSyntheticStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-3 border-b border-border flex items-center gap-2 bg-muted/30">
        <Bot className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">{t('chat.header')}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="p-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                }`}
              >
                <p>{renderMessageText(msg, t)}</p>
                <span
                  className={`block text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-muted-foreground/20 text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t('chat.generatingStatus')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInputArea />
    </div>
  );
}
