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
  RotateCcw,         // Sıfırlama
  Check,
  AlertCircle,
  Loader2            // Auto-save spinner
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { ThemeToggle } from '@/components/custom/ThemeToggle/ThemeToggle';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useExport } from '../../hooks/useExport';

interface AnnotationToolbarProps {
  projectName: string;
  currentIndex: number;
  totalImages: number;
  /** Manuel save callback'i (useAnnotationAutoSave'den) */
  onSave?: () => void;
  /** Save işlemi sürerken true */
  isSaving?: boolean;
  /** Onaya gönderme callback'i */
  onSubmit?: () => void;
  /** Submit işlemi sürerken true */
  isSubmitting?: boolean;
}

export default function AnnotationToolbar({
  projectName,
  currentIndex,
  totalImages,
  onSave,
  isSaving = false,
  onSubmit,
  isSubmitting = false,
}: AnnotationToolbarProps) {
  const goToPrev = useAppStore(state => state.goToPrev);
  const goToNext = useAppStore(state => state.goToNext);
  const currentTask = useAppStore(state => state.currentTask);

  const brightness = useAppStore(state => state.brightness);
  const setBrightness = useAppStore(state => state.setBrightness);
  const contrast = useAppStore(state => state.contrast);
  const setContrast = useAppStore(state => state.setContrast);
  const saturation = useAppStore(state => state.saturation);
  const setSaturation = useAppStore(state => state.setSaturation);
  const opacity = useAppStore(state => state.opacity);
  const setOpacity = useAppStore(state => state.setOpacity);
  const resetFilters = useAppStore(state => state.resetFilters);
  const isMagnifierActive = useAppStore(state => state.isMagnifierActive);
  const setIsMagnifierActive = useAppStore(state => state.setIsMagnifierActive);
  const zoomIn = useAppStore(state => state.zoomIn);
  const zoomOut = useAppStore(state => state.zoomOut);
  const resetViewer = useAppStore(state => state.resetViewer);
  const activeTool = useAppStore(state => state.activeTool);
  const setActiveTool = useAppStore(state => state.setActiveTool);
  const undo = useAppStore(state => state.undo);
  const redo = useAppStore(state => state.redo);
  const history = useAppStore(state => state.history);
  const historyIndex = useAppStore(state => state.historyIndex);
  const isReadOnly = useAppStore(state => state.isReadOnly);

  const { t } = useTranslation('annotation');
  const { handleExport } = useExport();

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

          {!isReadOnly && (
            <>
              <Button variant="ghost" size="icon" onClick={resetViewer} className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t('toolbar.undo')}>
                <Undo size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30" title={t('toolbar.redo')}>
                <Redo size={16} />
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
            </>
          )}

          <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t('toolbar.zoomIn')}>
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t('toolbar.zoomOut')}>
            <ZoomOut size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveTool('pan')} 
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", activeTool === 'pan' && "bg-primary/10 text-primary")} 
            title={t('toolbar.panTool')}
          >
            <Hand size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMagnifierActive(!isMagnifierActive)} 
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", isMagnifierActive && "bg-primary/10 text-primary")} 
            title={t('toolbar.magnifier')}
          >
            <Search size={16} />
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button variant="ghost" size="icon" onClick={resetViewer} className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t('toolbar.resetView')}>
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
          {t('toolbar.prev')}
        </Button>

        <span className="text-xs text-muted-foreground font-mono min-w-[80px] text-center">
          {currentIndex + 1} / {totalImages}
        </span>

        <Button
          size="sm"
          onClick={goToNext}
          className="gap-1.5 h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary/90"
        >
          {t('toolbar.next')}
          <ChevronRight size={14} />
        </Button>
      </div>

      {/* Sağ: Görünüm Ayarları & Aksiyonlar */}
      <div className="flex items-center justify-end gap-2">
        {/* Görev Durumu ve Rol Bilgisi */}
        {currentTask && (
          <div className="flex items-center gap-2 mr-2">
            <Badge variant="outline" className="text-[10px] h-5 capitalize">
              {currentTask.status.replace('_', ' ')}
            </Badge>
            {isReadOnly && (
              <Badge variant="secondary" className="text-[10px] h-5 bg-amber-500/10 text-amber-500 border-amber-500/20">
                {t('common.readOnly')}
              </Badge>
            )}
            {currentTask.rejection_note && (
               <Popover>
               <PopoverTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10">
                   <AlertCircle size={14} />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-64 p-3 text-xs">
                 <p className="font-bold mb-1 text-destructive">Rejection Note:</p>
                 <p className="text-muted-foreground">{currentTask.rejection_note}</p>
               </PopoverContent>
             </Popover>
            )}
          </div>
        )}

        {/* YENİ: Görünüm ve Opaklık Ayarları Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
              <SlidersHorizontal size={14} />
              {t('toolbar.viewSettings')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-sm">{t('toolbar.imageSettings')}</h4>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={resetFilters}>
                  <RotateCcw size={10} className="mr-1" /> {t('toolbar.reset')}
                </Button>
              </div>

              {/* Parlaklık */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Sun size={12} /> {t('toolbar.brightness')}</Label>
                  <span className="text-[10px] text-muted-foreground">{brightness}%</span>
                </div>
                <Slider value={[brightness]} onValueChange={(vals) => setBrightness(vals[0])} max={200} step={1} />
              </div>

              {/* Kontrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Contrast size={12} /> {t('toolbar.contrast')}</Label>
                  <span className="text-[10px] text-muted-foreground">{contrast}%</span>
                </div>
                <Slider value={[contrast]} onValueChange={(vals) => setContrast(vals[0])} max={200} step={1} />
              </div>

              {/* Doygunluk */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2"><Droplets size={12} /> {t('toolbar.saturation')}</Label>
                  <span className="text-[10px] text-muted-foreground">{saturation}%</span>
                </div>
                <Slider value={[saturation]} onValueChange={(vals) => setSaturation(vals[0])} max={200} step={1} />
              </div>

              <Separator />

              {/* Opaklık (Maske/Poligonlar için) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2 font-semibold text-primary">
                    <Layers size={12} /> {t('toolbar.maskOpacity')}
                  </Label>
                  <span className="text-[10px] font-mono">{opacity}%</span>
                </div>
                <Slider value={[opacity]} onValueChange={(vals) => setOpacity(vals[0])} max={100} step={1} />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5" />

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t('toolbar.settings')}>
          <Settings size={15} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download size={13} />
              {t('toolbar.export')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('toolbar.exportOptions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('coco')} className="cursor-pointer">
              {t('toolbar.exportCOCO')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('yolo')} className="cursor-pointer">
              {t('toolbar.exportYOLO')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('visual_genome')} className="cursor-pointer">
              {t('toolbar.exportVG')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {!isReadOnly && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onSave}
              disabled={isSaving}
              title={t('toolbar.saveTooltip')}
            >
              {isSaving
                ? <Loader2 size={13} className="animate-spin" />
                : <Save size={13} />}
              {t('toolbar.save')}
            </Button>

            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90"
              onClick={onSubmit}
              disabled={isSubmitting || (currentTask?.status === 'approval_pending')}
              title={t('toolbar.submitTooltip')}
            >
              {isSubmitting
                ? <Loader2 size={13} className="animate-spin" />
                : <Check size={14} />}
              {t('toolbar.submit')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}