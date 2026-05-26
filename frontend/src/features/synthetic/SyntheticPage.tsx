// src/features/synthetic/pages/SyntheticPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiKeyService } from '../api-keys/services/apiKeyService';
import { projectService } from '@/features/projects/services/projectService';
import { datasetService } from '@/features/datasets/services/datasetService';
import { Button } from "@/components/ui/button";
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
  SlidersHorizontal,
  Folder,
  Database,
  CloudLightning
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
  { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60', prompt: 'Cinematic night street with neon lights and heavy rain, high detail autonomous vehicle view' },
  { url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&auto=format&fit=crop&q=60', prompt: 'Heavy snowy forest highway morning scene, clear road markings under fog' },
  { url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop&q=60', prompt: 'Sunny landscape with severe lens flare and reflections on asphalt' },
  { url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=60', prompt: 'Cyberpunk Tokyo alleyway, puddles reflecting neon pink billboard lights, twilight' },
  { url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60', prompt: 'Dusty desert highway during sunset, sandstorm blowing across road segments' }
];

export default function SyntheticPage() {
  const { t } = useTranslation('synthetic');
  
  // --- GÖRSEL VE EDİTÖR STATE'LERİ ---
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
  const [filters, setFilters] = useState({ invert: false, grayscale: false, sepia: false, blur: 0, brightness: 100 });
  const [messages, setMessages] = useState<Message[]>([]);

  // --- PROJE / DATASET / S3 ENTEGRASYON STATE'LERİ ---
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [datasetsList, setDatasetsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isUploadingToS3, setIsUploadingToS3] = useState<boolean>(false);
  const [showDestinationSelector, setShowDestinationSelector] = useState<boolean>(false);

  // --- PROJELERİ ILK ACILISTA FETCH ETME ---
  useEffect(() => {
    const loadInitialProjects = async () => {
      try {
        const projectsData = await projectService.getAllProjects();
        const activeProjects = projectsData?.results || projectsData?.data || projectsData || [];
        setProjectsList(activeProjects);
      } catch (err) {
        console.error("Synthetic target fetching failed:", err);
        toast.error("Failed to load targets for synthetic export.");
      }
    };
    loadInitialProjects();
  }, []);

  // --- PROJE SECILINCE DATASETLERI GETIRME ---
  useEffect(() => {
    const loadLinkedDatasets = async () => {
      if (!selectedProjectId) {
        setDatasetsList([]);
        return;
      }
      try {
        const datasetsData = await datasetService.getAllDatasets(selectedProjectId);
        const activeDatasets = datasetsData?.results || datasetsData?.data || datasetsData || [];
        setDatasetsList(activeDatasets);
        setSelectedDatasetId(''); // Önceki seçimi sıfırla
      } catch (err) {
        console.error("Failed to sync datasets:", err);
        toast.error("Could not fetch target database segments.");
      }
    };
    loadLinkedDatasets();
  }, [selectedProjectId]);

  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        sender: 'ai',
        text: t('aiResponses.welcome', 'Welcome to Synthetic Data Studio. Please verify your provider API keys before running generation prompts.'),
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

  const checkHasValidKey = (): boolean => {
    const activeKey = apiKeyService.getExternalKey()?.trim();
    if (!activeKey || !activeKey.startsWith("sk-") || activeKey.length < 10) {
      toast.error("İşlem Başarısız: Lütfen önce API Anahtarları sayfasından 'sk-' ile başlayan en az 10 karakterli geçerli bir OpenAI API anahtarı bağlayın.");
      return false;
    }
    return true;
  };

  const triggerImageGeneration = (customPrompt?: string) => {
    if (!checkHasValidKey()) return;
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

  // --- SEÇİM VE S3 UPLOAD AKIŞI ---
  const handleDecision = (status: 'accepted' | 'rejected') => {
    if (images.length === 0 || isGenerating) return;
    
    if (status === 'accepted') {
      // Eğer kabul edildiyse önce lokasyon seçim panelini açıyoruz
      setShowDestinationSelector(true);
    } else {
      // Reddedildiyse direk bir sonraki görsele geç
      applyStatusAndAdvance('rejected');
    }
  };

  const applyStatusAndAdvance = (status: 'accepted' | 'rejected') => {
    const updatedImages = [...images];
    updatedImages[currentIndex].status = status;
    setImages(updatedImages);
    
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetEditorSettings();
    }
    setShowDestinationSelector(false);
  };

  // Onaylama işlemi bitip S3 yüklemesi başladığında tetiklenecek fonksiyon
  const handleFinalS3Upload = async () => {
    if (!selectedProjectId || !selectedDatasetId) {
      toast.warning("Please choose a valid destination workspace and database partition.");
      return;
    }

    setIsUploadingToS3(true);
    const toastId = toast.loading("Initializing secure S3 binary payload streaming...");

    try {
      // S3 ve Backend veritabanı yazma simülasyonu
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Asset pushed to AWS S3 & linked with taxonomy catalog!", { id: toastId });
      applyStatusAndAdvance('accepted');
    } catch (err) {
      console.error(err);
      toast.error("S3 ingestion pipeline timeout error.", { id: toastId });
    } finally {
      setIsUploadingToS3(false);
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
  }, [currentIndex, images, isGenerating, selectedProjectId, selectedDatasetId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = chatInput.trim();
    if (!trimmedInput || isGenerating) return;

    if (trimmedInput.startsWith("sk-")) {
      toast.warning("Güvenlik Uyarısı: API Anahtarınızı sohbet kutusuna yazamazsınız. Lütfen sol menüdeki 'API Anahtarları' sayfasından tanımlayın.");
      setChatInput('');
      return;
    }

    if (!checkHasValidKey()) return;

    const userText = trimmedInput.toLowerCase();
    const userMsg: Message = {
      id: `m_user_${Date.now()}`,
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    let aiResponseText = "";
    let isCommandAction = false;

    if (userText.includes('sıfırla') || userText.includes('temizle') || userText.includes('orijinal') || userText.includes('reset') || userText.includes('clear')) {
      resetEditorSettings();
      aiResponseText = t('aiResponses.reset', 'Canvas and filters successfully reset to original state.');
      isCommandAction = true;
    }

    if (userText.includes('döndür') || userText.includes('çevir') || userText.includes('derece') || userText.includes('rotate') || userText.includes('degree')) {
      const degreeMatch = userText.match(/(-?\d+)/); 
      if (degreeMatch) {
        const customDegree = parseInt(degreeMatch[1], 10);
        setRotation(prev => prev + customDegree);
        aiResponseText += t('aiResponses.rotate', 'Rotated by {{degree}} degrees.', { degree: customDegree });
      } else {
        setRotation(prev => prev + 90);
        aiResponseText += t('aiResponses.rotateDefault', 'Rotated canvas by 90 degrees.');
      }
      isCommandAction = true;
    }

    if (userText.includes('zoom in') || userText.includes('yakınlaştır') || userText.includes('büyüt') || userText.includes('enlarge')) {
      setZoom(prev => Math.min(prev + 0.3, 3));
      aiResponseText += t('aiResponses.zoomIn', 'Zoomed in successfully.');
      isCommandAction = true;
    } else if (userText.includes('zoom out') || userText.includes('uzaklaştır') || userText.includes('küçült') || userText.includes('shrink')) {
      setZoom(prev => Math.max(prev - 0.3, 0.5));
      aiResponseText += t('aiResponses.zoomOut', 'Zoomed out successfully.');
      isCommandAction = true;
    }

    if (userText.includes('invert') || userText.includes('tersine çevir')) {
      setFilters(prev => ({ ...prev, invert: !prev.invert }));
      aiResponseText += t('aiResponses.invert', 'Invert filter toggled.');
      isCommandAction = true;
    }
    if (userText.includes('siyah beyaz') || userText.includes('grayscale') || userText.includes('gri') || userText.includes('monochrome')) {
      setFilters(prev => ({ ...prev, grayscale: true, sepia: false }));
      aiResponseText += t('aiResponses.grayscale', 'Applied grayscale effect.');
      isCommandAction = true;
    }
    if (userText.includes('sepya') || userText.includes('sepia')) {
      setFilters(prev => ({ ...prev, sepia: true, grayscale: false }));
      aiResponseText += t('aiResponses.sepia', 'Applied sepia effect.');
      isCommandAction = true;
    }
    if (userText.includes('blur') || userText.includes('bulanık')) {
      setFilters(prev => ({ ...prev, blur: prev.blur === 0 ? 4 : 0 }));
      aiResponseText += t('aiResponses.blur', 'Blur filter changed.');
      isCommandAction = true;
    }

    setTimeout(() => {
      if (isCommandAction) {
        setMessages(prev => [...prev, {
          id: `m_ai_${Date.now()}`,
          sender: 'ai',
          text: aiResponseText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `m_ai_${Date.now()}`,
          sender: 'ai',
          text: t('aiResponses.generationStarted', 'Generation pipeline triggered for prompt: "{{text}}"', { text: userText }),
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1600px] mx-auto p-4 space-y-4 text-slate-800 dark:text-slate-200">
      {/* Üst Bilgi Barı */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-violet-600 dark:text-violet-400 w-5 h-5" /> {t('title', 'Synthetic Generation Studio')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('subtitle', 'Generate and annotate synthetic images using customized AI setups')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="font-medium text-slate-600 dark:text-slate-400">{t('image', 'Image')}: <strong className="text-slate-900 dark:text-white">{images.length > 0 ? currentIndex + 1 : 0} / {images.length}</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            {t('status', 'Status')}: 
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
              currentImage.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
              currentImage.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
            }`}>
              {t(currentImage.status, currentImage.status.toUpperCase())}
            </span>
          </span>
        </div>
      </div>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* SOL TARAF: CHAT PANELİ */}
        <div className="w-full md:w-5/12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-2xl">
            <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t('copilotTitle', 'AI Co-Pilot Workspace')}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className={`block text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-violet-200' : 'text-slate-400 dark:text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-2xl flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isGenerating}
              placeholder={isGenerating ? t('inputPlaceholderGenerating', 'AI Engine processing response...') : t('inputPlaceholder', 'Ask Co-Pilot to edit canvas or generate new samples...')}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 disabled:opacity-50"
            />
            <button type="submit" disabled={isGenerating} className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white p-2 rounded-xl transition shadow-sm disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* SAĞ TARAF: GÖRSEL SEKMESİ VE EDİTÖRÜ */}
        <div className="w-full md:w-7/12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-0 overflow-hidden relative">
          
          {/* 👑 ADIM ADIM SEÇİM VE S3 UPLOAD KATMANI (MODAL/PANEL) */}
          {showDestinationSelector && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CloudLightning className="text-indigo-600 w-5 h-5 animate-pulse" /> S3 Target Pipeline Deployment
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Route synthetic asset matrix into ecosystem cluster partitions.</p>
                  </div>
                  <button 
                    onClick={() => setShowDestinationSelector(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 dark:bg-slate-800 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Adım 1: Proje Seçimi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                      <Folder size={12} /> 1. Select Target Project Workspace
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full text-xs h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">-- Choose a Workspace --</option>
                      {projectsList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name || 'Unnamed Cluster'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Adım 2: Dataset Seçimi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                      <Database size={12} /> 2. Select Database Repository Partition
                    </label>
                    <select
                      value={selectedDatasetId}
                      onChange={(e) => setSelectedDatasetId(e.target.value)}
                      disabled={!selectedProjectId}
                      className="w-full text-xs h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 disabled:opacity-40"
                    >
                      <option value="">-- Choose Repository --</option>
                      {datasetsList.map((d) => (
                        <option key={d.id} value={d.id}>{d.name || 'Unnamed Repository'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Adım 3: S3 Gönderme Butonları */}
                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDestinationSelector(false)}
                    className="w-1/3 rounded-xl text-xs h-9 dark:border-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleFinalS3Upload}
                    disabled={isUploadingToS3 || !selectedProjectId || !selectedDatasetId}
                    className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-9 font-bold"
                  >
                    {isUploadingToS3 ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Uploading S3...
                      </>
                    ) : (
                      "Confirm & Sync Storage"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs font-mono flex items-center justify-between shrink-0 min-w-0 border-b dark:border-slate-800">
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
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white px-2 py-1 rounded-md transition disabled:opacity-50 font-sans font-medium"
              >
                <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                <span>{t('regenerate', 'Regenerate')}</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative p-4 overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm animate-pulse">
                <Loader2 size={36} className="animate-spin text-violet-500" />
                <span>{t('generatingText', 'Synthesizing layout data...')}</span>
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
                    {t(currentImage.status, currentImage.status.toUpperCase())}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-slate-500 font-mono text-sm">{t('noImage', 'No viewport track loaded')}</span>
            )}

            {/* Filtre Bilgi Katmanı */}
            {(filters.invert || filters.grayscale || filters.sepia || filters.blur > 0 || zoom !== 1 || rotation !== 0) && (
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-[10px] text-violet-300 font-mono px-2 py-1 rounded border border-slate-800 flex items-center gap-1.5 pointer-events-none">
                <SlidersHorizontal size={10} />
                <span>{t('activeFilters', 'Rotation: {{rotation}}°, Zoom: {{zoom}}x', { rotation, zoom: zoom.toFixed(1) })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALT PANEL: REDDET / ONAYLA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <div className="flex items-center gap-1"><span className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm text-slate-600 dark:text-slate-300">A</span> {t('accept', 'Accept')}</div>
          <div className="flex items-center gap-1"><span className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm text-slate-600 dark:text-slate-300">R</span> {t('reject', 'Reject')}</div>
          <div className="flex items-center gap-1"><span className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm text-slate-600 dark:text-slate-300">←</span> {t('guidePrev', 'Prev')}</div>
          <div className="flex items-center gap-1"><span className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm text-slate-600 dark:text-slate-300">→</span> {t('guideNext', 'Next')}</div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          <button 
            onClick={() => handleDecision('rejected')}
            disabled={images.length === 0 || isGenerating}
            className="flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <X size={18} /> {t('reject', 'Reject')} (R)
          </button>

          <button 
            onClick={() => handleDecision('accepted')}
            disabled={images.length === 0 || isGenerating}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition shadow-md active:scale-95 disabled:opacity-50"
          >
            <Check size={18} /> {t('accept', 'Accept')} (A)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0 || isGenerating}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 border dark:border-slate-800 rounded-lg">
            {images.length > 0 ? currentIndex + 1 : 0} / {images.length}
          </span>
          <button 
            onClick={handleNext}
            disabled={currentIndex === images.length - 1 || isGenerating}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}