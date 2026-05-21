// src/features/synthetic/pages/SyntheticPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Bot, 
  User, 
  Image as ImageIcon,
  RefreshCw,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  SlidersHorizontal
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const AI_GENERATION_POOL = [
  {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
    prompt: 'Cinematic night street with neon lights and heavy rain, high detail autonomous vehicle view'
  },
  {
    url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&auto=format&fit=crop&q=60',
    prompt: 'Heavy snowy forest highway morning scene, clear road markings under fog'
  },
  {
    url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop&q=60',
    prompt: 'Sunny landscape with severe lens flare and reflections on asphalt'
  },
  {
    url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=60',
    prompt: 'Cyberpunk Tokyo alleyway, puddles reflecting neon pink billboard lights, twilight'
  },
  {
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60',
    prompt: 'Dusty desert highway during sunset, sandstorm blowing across road segments'
  }
];

export default function SyntheticPage() {
  const { t } = useTranslation('synthetic');
  
  const [images, setImages] = useState<ImageItem[]>([
    { id: 'img_1', url: AI_GENERATION_POOL[0].url, prompt: AI_GENERATION_POOL[0].prompt, status: 'pending' },
    { id: 'img_2', url: AI_GENERATION_POOL[1].url, prompt: AI_GENERATION_POOL[1].prompt, status: 'pending' },
    { id: 'img_3', url: AI_GENERATION_POOL[2].url, prompt: AI_GENERATION_POOL[2].prompt, status: 'pending' }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [filters, setFilters] = useState({
    invert: false,
    grayscale: false,
    sepia: false,
    blur: 0,
    brightness: 100
  });

  const [messages, setMessages] = useState<Message[]>([]);

  // İlk açılışta veya dil değiştiğinde hoş geldin mesajını senkronize etmek için
  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        sender: 'ai',
        text: t('aiResponses.welcome'),
        timestamp: '2026-05-21 20:00'
      }
    ]);
  }, [t]);

  const currentImage = images[currentIndex] || { url: '', prompt: '', status: 'pending' };

  const resetEditorSettings = () => {
    setZoom(1);
    setRotation(0);
    setFilters({ invert: false, grayscale: false, sepia: false, blur: 0, brightness: 100 });
  };

  const triggerImageGeneration = (customPrompt?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    resetEditorSettings();

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * AI_GENERATION_POOL.length);
      const selectedSample = AI_GENERATION_POOL[randomIndex];

      const newImage: ImageItem = {
        id: `img_${Date.now()}`,
        url: selectedSample.url,
        prompt: customPrompt || selectedSample.prompt,
        status: 'pending'
      };

      setImages(prev => {
        const updated = [...prev, newImage];
        setCurrentIndex(updated.length - 1);
        return updated;
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleDecision = (status: 'accepted' | 'rejected') => {
    if (images.length === 0 || isGenerating) return;
    const updatedImages = [...images];
    updatedImages[currentIndex].status = status;
    setImages(updatedImages);
    
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetEditorSettings();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isGenerating) {
      setCurrentIndex(currentIndex - 1);
      resetEditorSettings();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1 && !isGenerating) {
      setCurrentIndex(currentIndex + 1);
      resetEditorSettings();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key.toLowerCase() === 'a') handleDecision('accepted');
      if (e.key.toLowerCase() === 'r') handleDecision('rejected');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images, isGenerating]);

  // --- CO-PILOT AKILLI DİL VE KOMUT PARSERI ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userText = chatInput.toLowerCase();
    const userMsg: Message = {
      id: `m_user_${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    let aiResponseText = "";
    let isCommandAction = false;

    // 1. RESET / SIFIRLAMA
    if (userText.includes('sıfırla') || userText.includes('temizle') || userText.includes('orijinal') || userText.includes('reset') || userText.includes('clear')) {
      resetEditorSettings();
      aiResponseText = t('aiResponses.reset');
      isCommandAction = true;
    }

    // 2. DINAMIK DERECELI ROTASYON (Hem Türkçe hem İngilizce tetikleyiciler)
    if (userText.includes('döndür') || userText.includes('çevir') || userText.includes('derece') || userText.includes('rotate') || userText.includes('degree')) {
      const degreeMatch = userText.match(/(-?\d+)/); 
      
      if (degreeMatch) {
        const customDegree = parseInt(degreeMatch[1], 10);
        setRotation(prev => prev + customDegree);
        aiResponseText += t('aiResponses.rotate', { degree: customDegree });
      } else {
        setRotation(prev => prev + 90);
        aiResponseText += t('aiResponses.rotateDefault');
      }
      isCommandAction = true;
    }

    // 3. ZOOM LAYER
    if (userText.includes('zoom in') || userText.includes('yakınlaştır') || userText.includes('büyüt') || userText.includes('enlarge')) {
      setZoom(prev => Math.min(prev + 0.3, 3));
      aiResponseText += t('aiResponses.zoomIn');
      isCommandAction = true;
    } else if (userText.includes('zoom out') || userText.includes('uzaklaştır') || userText.includes('küçült') || userText.includes('shrink')) {
      setZoom(prev => Math.max(prev - 0.3, 0.5));
      aiResponseText += t('aiResponses.zoomOut');
      isCommandAction = true;
    }

    // 4. FILTERS (INVERT, GRAYSCALE, SEPIA, BLUR)
    if (userText.includes('invert') || userText.includes('tersine çevir')) {
      setFilters(prev => ({ ...prev, invert: !prev.invert }));
      aiResponseText += t('aiResponses.invert');
      isCommandAction = true;
    }
    if (userText.includes('siyah beyaz') || userText.includes('grayscale') || userText.includes('gri') || userText.includes('monochrome')) {
      setFilters(prev => ({ ...prev, grayscale: true, sepia: false }));
      aiResponseText += t('aiResponses.grayscale');
      isCommandAction = true;
    }
    if (userText.includes('sepya') || userText.includes('sepia')) {
      setFilters(prev => ({ ...prev, sepia: true, grayscale: false }));
      aiResponseText += t('aiResponses.sepia');
      isCommandAction = true;
    }
    if (userText.includes('blur') || userText.includes('bulanık')) {
      setFilters(prev => ({ ...prev, blur: prev.blur === 0 ? 4 : 0 }));
      aiResponseText += t('aiResponses.blur');
      isCommandAction = true;
    }

    // YANIT TETIKLEME SÜRECI
    setTimeout(() => {
      if (isCommandAction) {
        setMessages(prev => [...prev, {
          id: `m_ai_${Date.now()}`,
          sender: 'ai',
          text: aiResponseText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        // Eğer editör komutu yakalanmadıysa doğrudan yeni sentetik prompt üretimine yönlendirilir
        setMessages(prev => [...prev, {
          id: `m_ai_${Date.now()}`,
          sender: 'ai',
          text: t('aiResponses.generationStarted', { text: userText }),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        triggerImageGeneration(userText);
      }
    }, 600);
  };

  const computedFilterString = `
    ${filters.invert ? 'invert(1)' : 'invert(0)'}
    ${filters.grayscale ? 'grayscale(1)' : 'grayscale(0)'}
    ${filters.sepia ? 'sepia(1)' : 'sepia(0)'}
    blur(${filters.blur}px)
    brightness(${filters.brightness}%)
  `.trim();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto p-4 space-y-4 text-slate-800">
      
      {/* Üst Bilgi Barı */}
      <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-violet-600 w-5 h-5" /> {t('title')}
          </h1>
          <p className="text-xs text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <span className="font-medium text-slate-600">{t('image')}: <strong className="text-slate-900">{images.length > 0 ? currentIndex + 1 : 0} / {images.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            {t('status')}: 
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
              currentImage.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
              currentImage.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {t(currentImage.status)}
            </span>
          </span>
        </div>
      </div>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* SOL TARAF: CHAT PANELİ */}
        <div className="w-full md:w-5/12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50 rounded-t-2xl">
            <Bot className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900 text-sm">{t('copilotTitle')}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-2xs ${
                  msg.sender === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className={`block text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isGenerating}
              placeholder={isGenerating ? t('inputPlaceholderGenerating') : t('inputPlaceholder')}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50"
            />
            <button type="submit" disabled={isGenerating} className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-xl transition shadow-xs disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* SAĞ TARAF: GÖRSEL SEKMESİ VE EDİTÖRÜ */}
        <div className="w-full md:w-7/12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
          
          <div className="p-3 bg-slate-900 text-slate-200 text-xs font-mono flex items-center justify-between shrink-0 min-w-0">
            <div className="flex items-center gap-2 truncate flex-1 mr-2">
              <ImageIcon size={14} className="text-violet-400 shrink-0" />
              <span className="truncate">"{isGenerating ? "Generating..." : currentImage.prompt || "No prompt"}"</span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><ZoomIn size={13} /></button>
              <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><ZoomOut size={13} /></button>
              <button onClick={() => setRotation(r => r + 90)} className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><RotateCw size={13} /></button>
              <button onClick={resetEditorSettings} className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 font-sans font-semibold rounded text-[10px]">Reset</button>
              
              <span className="text-slate-700 px-0.5">|</span>

              <button 
                type="button"
                onClick={() => triggerImageGeneration()}
                disabled={isGenerating}
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-2 py-1 rounded-md transition disabled:opacity-50 font-sans font-medium"
              >
                <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                <span>{t('regenerate')}</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative p-4 overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm animate-pulse">
                <Loader2 size={36} className="animate-spin text-violet-500" />
                <span>{t('generatingText')}</span>
              </div>
            ) : currentImage.url ? (
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              >
                <img 
                  src={currentImage.url} 
                  alt="Synthetic Studio Visual" 
                  style={{ filter: computedFilterString }}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-all duration-200"
                />
                
                {currentImage.status !== 'pending' && (
                  <div 
                    className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider border shadow-xl z-20 ${
                      currentImage.status === 'accepted' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'
                    }`}
                    style={{ transform: `rotate(${-rotation}deg) scale(${1 / zoom})` }}
                  >
                    {t(currentImage.status)}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-slate-500 font-mono text-sm">{t('noImage')}</span>
            )}

            {/* Filtre Bilgi Katmanı */}
            {(filters.invert || filters.grayscale || filters.sepia || filters.blur > 0 || zoom !== 1 || rotation !== 0) && (
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-[10px] text-violet-300 font-mono px-2 py-1 rounded border border-slate-800 flex items-center gap-1.5 pointer-events-none">
                <SlidersHorizontal size={10} />
                <span>{t('activeFilters', { rotation, zoom: zoom.toFixed(1) })}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ALT PANEL: REDDET / ONAYLA */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1"><span className="bg-slate-100 border px-1.5 py-0.5 rounded shadow-2xs text-slate-600">A</span> {t('accept')}</div>
          <div className="flex items-center gap-1"><span className="bg-slate-100 border px-1.5 py-0.5 rounded shadow-2xs text-slate-600">R</span> {t('reject')}</div>
          <div className="flex items-center gap-1"><span className="bg-slate-100 border px-1.5 py-0.5 rounded shadow-2xs text-slate-600">←</span> {t('guidePrev')}</div>
          <div className="flex items-center gap-1"><span className="bg-slate-100 border px-1.5 py-0.5 rounded shadow-2xs text-slate-600">→</span> {t('guideNext')}</div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          <button 
            onClick={() => handleDecision('rejected')}
            disabled={images.length === 0 || isGenerating}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-6 py-3 rounded-xl font-semibold text-sm transition shadow-xs active:scale-95 disabled:opacity-50"
          >
            <X size={18} /> {t('reject')} (R)
          </button>

          <button 
            onClick={() => handleDecision('accepted')}
            disabled={images.length === 0 || isGenerating}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition shadow-md active:scale-95 disabled:opacity-50"
          >
            <Check size={18} /> {t('accept')} (A)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0 || isGenerating}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 border rounded-lg">
            {images.length > 0 ? currentIndex + 1 : 0} / {images.length}
          </span>
          <button 
            onClick={handleNext}
            disabled={currentIndex === images.length - 1 || isGenerating}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}