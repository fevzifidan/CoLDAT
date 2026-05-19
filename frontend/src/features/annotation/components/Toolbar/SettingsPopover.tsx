import { useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  SlidersHorizontal,
  Trash2,
  AlertTriangle,
  Database,
  RotateCcw,
  Contrast,
  Droplets,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/store/hooks/useAppStore';
import { useConfirm } from '@/shared/services/confirmation/useConfirm';
import { clearCache, getCacheSize } from '@/features/annotation/tools/sam/embeddingCache';
import { notificationService } from '@/shared/services/notification/notification.service';
import LanguageSelector from '@/components/custom/LanguageSelector/LanguageSelector';

type SettingsPage = 'main' | 'view' | 'sam' | 'livewire';

export default function SettingsPopover() {
  const { t } = useTranslation('annotation');
  const { theme, setTheme } = useTheme();
  const { confirm } = useConfirm();
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [page, setPage] = useState<SettingsPage>('main');

  // Store'dan görünüm değerlerini al
  const {
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
    opacity,
    setOpacity,
    resetFilters,
  } = useAppStore(
    useShallow((state) => ({
      brightness: state.brightness,
      setBrightness: state.setBrightness,
      contrast: state.contrast,
      setContrast: state.setContrast,
      saturation: state.saturation,
      setSaturation: state.setSaturation,
      opacity: state.opacity,
      setOpacity: state.setOpacity,
      resetFilters: state.resetFilters,
    }))
  );

  const { livewireEpsilon, setLivewireEpsilon } = useAppStore(
    useShallow((state) => ({
      livewireEpsilon: state.livewireEpsilon,
      setLivewireEpsilon: state.setLivewireEpsilon,
    }))
  );

  // Popover kapanınca ana sayfaya dön
  useEffect(() => {
    if (!settingsOpen) {
      const timer = setTimeout(() => setPage('main'), 200);
      return () => clearTimeout(timer);
    }
  }, [settingsOpen]);

  // Cache boyutunu yükle — SAM sayfasındayken
  useEffect(() => {
    if (settingsOpen && page === 'sam') {
      getCacheSize().then(setCacheSize);
    }
  }, [settingsOpen, page]);

  // SAM cache temizleme handler
  const handleClearSAMCache = useCallback(async () => {
    const confirmed = await confirm({
      title: t('toolbar.clearSAMCacheConfirmTitle'),
      description: t('toolbar.clearSAMCacheConfirmDescription'),
      confirmText: t('toolbar.clearSAMCacheConfirmButton'),
      cancelText: t('common:actions.cancel'),
      variant: 'destructive',
      icon: <AlertTriangle />,
      iconSize: 'lg',
    });

    if (confirmed) {
      await clearCache();
      setCacheSize(0);
      notificationService.success(t('toolbar.samCacheCleared'));
    }
  }, [confirm, t]);

  // Slider handler'lar
  const handleBrightnessChange = useCallback(
    (vals: number[]) => setBrightness(vals[0]),
    [setBrightness]
  );
  const handleContrastChange = useCallback(
    (vals: number[]) => setContrast(vals[0]),
    [setContrast]
  );
  const handleSaturationChange = useCallback(
    (vals: number[]) => setSaturation(vals[0]),
    [setSaturation]
  );
  const handleOpacityChange = useCallback(
    (vals: number[]) => setOpacity(vals[0]),
    [setOpacity]
  );

  return (
    <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={t('toolbar.settings')}
        >
          <Settings size={15} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="end">
        <div className="max-h-[350px] overflow-y-auto w-full">
          {page === 'main' && (
            <div className="p-2 flex flex-col gap-1 pb-3">
              {/* === TEMA SECTION === */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-9 px-2"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {theme === 'light' && <Sun size={16} />}
                      {theme === 'dark' && <Moon size={16} />}
                      {theme === 'system' && <Monitor size={16} />}
                      {t('toolbar.theme')}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {theme === 'light'
                        ? t('common:theme.light')
                        : theme === 'dark'
                          ? t('common:theme.dark')
                          : t('common:theme.system')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-44"
                  align="start"
                  side="left"
                  sideOffset={12}
                >
                  <DropdownMenuLabel>
                    {t('common:theme.appearance')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem
                      value="light"
                      className="cursor-pointer"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      <span>{t('common:theme.light')}</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="dark"
                      className="cursor-pointer"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      <span>{t('common:theme.dark')}</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="system"
                      className="cursor-pointer"
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>{t('common:theme.system')}</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

            <Separator className="my-1" />

              {/* === GÖRÜNÜM SECTION === */}
              <Button
                variant="ghost"
                className="w-full justify-between h-9 px-2"
                onClick={() => setPage('view')}
              >
                <span className="flex items-center gap-2 text-sm">
                  <SlidersHorizontal size={16} />
                  {t('toolbar.viewSettings')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('toolbar.viewSettingsDescription')}
                </span>
              </Button>

              <Separator className="my-1" />

              {/* === SAM SETTINGS SECTION === */}
              <Button
                variant="ghost"
                className="w-full justify-between h-9 px-2"
                onClick={() => setPage('sam')}
              >
                <span className="flex items-center gap-2 text-sm">
                  <Database size={16} />
                  {t('toolbar.samSettings')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('toolbar.samSettingsDescription')}
                </span>
              </Button>

              <Separator className="my-1" />

              {/* === LIVEWIRE SETTINGS SECTION === */}
              <Button
                variant="ghost"
                className="w-full justify-between h-9 px-2"
                onClick={() => setPage('livewire')}
              >
                <span className="flex items-center gap-2 text-sm">
                  <SlidersHorizontal size={16} />
                  {t('toolbar.livewireSettings')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('toolbar.livewireSettingsDescription')}
                </span>
              </Button>

              <Separator className="my-1" />

              {/* === DİL SECTION === */}
              <div className="px-2 py-1.5">
                <LanguageSelector className='max-w-full'/>
              </div>
            </div>
          )}

          {page === 'view' && (
            <div className="p-2 space-y-4 pb-6">
              {/* Geri butonu */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1 gap-1 text-xs text-muted-foreground"
                onClick={() => setPage('main')}
              >
                <ChevronLeft size={14} />
                {t('toolbar.settings')}
              </Button>

                <div className="px-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none text-sm">
                    {t('toolbar.imageSettings')}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={resetFilters}
                  >
                    <RotateCcw size={10} className="mr-1" />{' '}
                    {t('toolbar.reset')}
                  </Button>
                </div>

                {/* Parlaklık */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Sun size={12} /> {t('toolbar.brightness')}
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {brightness}%
                    </span>
                  </div>
                  <Slider
                    value={[brightness]}
                    onValueChange={handleBrightnessChange}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Kontrast */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Contrast size={12} /> {t('toolbar.contrast')}
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {contrast}%
                    </span>
                  </div>
                  <Slider
                    value={[contrast]}
                    onValueChange={handleContrastChange}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Doygunluk */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-2">
                      <Droplets size={12} /> {t('toolbar.saturation')}
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {saturation}%
                    </span>
                  </div>
                  <Slider
                    value={[saturation]}
                    onValueChange={handleSaturationChange}
                    max={200}
                    step={1}
                  />
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
                  <Slider
                    value={[opacity]}
                    onValueChange={handleOpacityChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>
          )}

          {page === 'sam' && (
            <div className="p-2 space-y-4 pb-6">
              {/* Geri butonu */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1 gap-1 text-xs text-muted-foreground"
                onClick={() => setPage('main')}
              >
                <ChevronLeft size={14} />
                {t('toolbar.settings')}
              </Button>

              <div className="px-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none text-sm">
                    {t('toolbar.samSettings')}
                  </h4>
                </div>

                {/* === SAM CACHE SECTION === */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Database size={14} />
                    <span>{t('toolbar.samCache')}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 px-1">
                    {cacheSize > 0
                      ? t('toolbar.samCacheEntries', { count: cacheSize })
                      : t('toolbar.samCacheInfo')}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-8 gap-1.5 text-xs mt-1"
                    onClick={handleClearSAMCache}
                    disabled={cacheSize === 0}
                  >
                    <Trash2 size={13} />
                    {t('toolbar.clearSAMCache')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {page === 'livewire' && (
            <div className="p-2 space-y-4 pb-6">
              {/* Geri butonu */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1 gap-1 text-xs text-muted-foreground"
                onClick={() => setPage('main')}
              >
                <ChevronLeft size={14} />
                {t('toolbar.settings')}
              </Button>

              <div className="px-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none text-sm">
                    {t('toolbar.livewireSettings')}
                  </h4>
                </div>

                {/* === EPSILON SLIDER === */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-2 font-semibold text-primary">
                      <SlidersHorizontal size={12} /> {t('toolbar.livewireEpsilon')}
                    </Label>
                    <span className="text-[10px] font-mono font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {livewireEpsilon.toFixed(1)} px
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed px-1">
                    {t('toolbar.livewireEpsilonDescription')}
                  </p>
                  <Slider
                    value={[livewireEpsilon]}
                    onValueChange={(vals) => setLivewireEpsilon(vals[0])}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    className="pt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
      
    </Popover>
  );
}
