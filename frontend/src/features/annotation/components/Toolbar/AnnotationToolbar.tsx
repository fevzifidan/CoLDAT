import {
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Settings,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Hand,
  Search,            // Büyüteç
  SlidersHorizontal, // Yeni: Görünüm ayarları ikonu
  Sun,               // Parlaklık
  Contrast,          // Kontrast
  Droplets,          // Doygunluk
  Layers,            // Opaklık
  RotateCcw          // Sıfırlama
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { ThemeToggle } from '@/components/custom/ThemeToggle/ThemeToggle';
import { cn } from '@/lib/utils';

interface AnnotationToolbarProps {
  projectName: string;
  currentIndex: number;
  totalImages: number;
}

export default function AnnotationToolbar({
  projectName,
  currentIndex,
  totalImages,
}: AnnotationToolbarProps) {
  const goToPrev = useAppStore(state => state.goToPrev);
  const goToNext = useAppStore(state => state.goToNext);

  const { 
    brightness, setBrightness,
    contrast, setContrast,
    saturation, setSaturation,
    opacity, setOpacity,
    resetFilters,
    isMagnifierActive, setIsMagnifierActive,
    zoomIn, zoomOut, resetViewer,
    activeTool, setActiveTool,
    undo, redo,
    history, historyIndex
  } = useAppStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex items-center justify-between h-14 px-4 gap-4 w-full border-b bg-background">

      {/* Sol: Proje Bilgisi & Tuval Araçları */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-bold tracking-widest uppercase text-primary">
            CoLDAT
          </span>
          <span className="text-muted-foreground/50 text-xs">·</span>
          <span className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">
            {projectName}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={undo} 
            disabled={!canUndo}
            className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30" 
            title="Undo"
          >
            <Undo size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={redo} 
            disabled={!canRedo}
            className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30" 
            title="Redo"
          >
            <Redo size={16} />
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Zoom In">
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Zoom Out">
            <ZoomOut size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveTool('pan')} 
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", activeTool === 'pan' && "bg-primary/10 text-primary")} 
            title="Pan Tool"
          >
            <Hand size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMagnifierActive(!isMagnifierActive)} 
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", isMagnifierActive && "bg-primary/10 text-primary")} 
            title="Magnifier"
          >
            <Search size={16} />
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="icon" onClick={resetViewer} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Reset View">
            <RotateCcw size={16} />
          </Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <ThemeToggle />
        </div>
      </div>

      {/* Orta: Navigasyon */}
      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrev}
          className="gap-1.5 h-8 px-3 text-xs font-semibold"
        >
          <ChevronLeft size={14} />
          PREV
        </Button>

        <span className="text-xs text-muted-foreground font-mono min-w-[80px] text-center">
          {currentIndex + 1} / {totalImages}
        </span>

        <Button
          size="sm"
          onClick={goToNext}
          className="gap-1.5 h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary/90"
        >
          NEXT
          <ChevronRight size={14} />
        </Button>
      </div>

      {/* Sağ: Görünüm Ayarları & Aksiyonlar */}
      <div className="flex items-center justify-end gap-2">

        {/* YENİ: Görünüm ve Opaklık Ayarları Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
              <SlidersHorizontal size={14} />
              Görünüm
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-sm">Görüntü Ayarları</h4>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={resetFilters}>
                  <RotateCcw size={10} className="mr-1" /> Sıfırla
                </Button>
              </div>

              {/* Parlaklık */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Sun size={12} /> Parlaklık</Label>
                  <span className="text-[10px] text-muted-foreground">{brightness}%</span>
                </div>
                <Slider value={[brightness]} onValueChange={(vals) => setBrightness(vals[0])} max={200} step={1} />
              </div>

              {/* Kontrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Contrast size={12} /> Kontrast</Label>
                  <span className="text-[10px] text-muted-foreground">{contrast}%</span>
                </div>
                <Slider value={[contrast]} onValueChange={(vals) => setContrast(vals[0])} max={200} step={1} />
              </div>

              {/* Doygunluk */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Droplets size={12} /> Doygunluk</Label>
                  <span className="text-[10px] text-muted-foreground">{saturation}%</span>
                </div>
                <Slider value={[saturation]} onValueChange={(vals) => setSaturation(vals[0])} max={200} step={1} />
              </div>

              <Separator />

              {/* Opaklık (Maske/Poligonlar için) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2 font-semibold text-primary">
                    <Layers size={12} /> Maske Opaklığı
                  </Label>
                  <span className="text-[10px] font-mono">{opacity}%</span>
                </div>
                <Slider value={[opacity]} onValueChange={(vals) => setOpacity(vals[0])} max={100} step={1} />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5" />

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Settings">
          <Settings size={15} />
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download size={13} />
          Export
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90">
          <Save size={13} />
          Save
        </Button>
      </div>
    </div>
  );
}