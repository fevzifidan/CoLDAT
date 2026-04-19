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
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { ThemeToggle } from '@/components/custom/ThemeToggle/ThemeToggle';

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
  const { goToPrev, goToNext } = useAnnotationStore();

  // Not: Bu değerlerin store'da olduğunu varsayıyoruz. 
  // Eğer henüz yoksa store'unuza eklemeniz gerekecektir.
  /*
  const { 
    brightness, setBrightness,
    contrast, setContrast,
    saturation, setSaturation,
    opacity, setOpacity,
    resetFilters
  } = useAnnotationStore();
  */

  return (
    <div className="flex items-center justify-between h-14 px-4 gap-4 w-full border-b bg-background">

      {/* Sol: Proje Bilgisi & Tuval Araçları */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
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

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Undo">
            <Undo size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Redo">
            <Redo size={16} />
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Zoom In">
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Zoom Out">
            <ZoomOut size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Pan Tool">
            <Hand size={16} />
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Reset View">
            <ThemeToggle />
          </Button>
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
      <div className="flex items-center justify-end gap-2 flex-1">

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
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => {/* reset logic */ }}>
                  <RotateCcw size={10} className="mr-1" /> Sıfırla
                </Button>
              </div>

              {/* Parlaklık */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Sun size={12} /> Parlaklık</Label>
                  <span className="text-[10px] text-muted-foreground">100%</span>
                </div>
                <Slider defaultValue={[100]} max={200} step={1} />
              </div>

              {/* Kontrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Contrast size={12} /> Kontrast</Label>
                  <span className="text-[10px] text-muted-foreground">100%</span>
                </div>
                <Slider defaultValue={[100]} max={200} step={1} />
              </div>

              {/* Doygunluk */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Droplets size={12} /> Doygunluk</Label>
                  <span className="text-[10px] text-muted-foreground">100%</span>
                </div>
                <Slider defaultValue={[100]} max={200} step={1} />
              </div>

              <Separator />

              {/* Opaklık (Maske/Poligonlar için) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2 font-semibold text-primary">
                    <Layers size={12} /> Maske Opaklığı
                  </Label>
                  <span className="text-[10px] font-mono">50%</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
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