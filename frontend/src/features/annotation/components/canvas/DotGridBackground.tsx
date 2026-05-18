import { useRef, useEffect, useCallback, memo } from 'react';

interface DotGridBackgroundProps {
  /** Radius of each dot */
  dotRadius?: number;
  /** Spacing between dots in pixels */
  dotSpacing?: number;
  /** Radius around cursor where dots highlight */
  hoverRadius?: number;
  /** Base color of dots (CSS color or variable) */
  color?: string;
  /** Opacity of dots (0-1) */
  opacity?: number;
  /**
   * Additional opacity boost for hovered dots.
   * Hovered dot opacity = Math.min(opacity + hoverBoost, 1)
   * This creates a subtle brightening effect without changing color.
   */
  hoverBoost?: number;
}

/**
 * Subtle dot grid background for the annotation canvas.
 * Renders a barely-visible static dot grid. When the cursor moves nearby,
 * dots within the hover radius get slightly brighter — no color change,
 * just a gentle opacity boost.
 *
 * No animations, no effects — minimal and performant.
 * Place this as an absolutely positioned element behind the Konva stage.
 *
 * Dark/Light mode aware: reads the actual background color luminance at
 * initialization to determine appropriate dot color (light bg → dark dots,
 * dark bg → light dots) so dots are always subtly visible.
 */
const DotGridBackground = memo(({
  dotRadius = 1.2,
  dotSpacing = 24,
  hoverRadius = 60,
  color,
  opacity,
  hoverBoost,
}: DotGridBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<{ x: number; y: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafIdRef = useRef<number | null>(null);
  const needsPaintRef = useRef(true);
  const resolvedColorRef = useRef<{ base: string; hover: string } | null>(null);
  const paramsRef = useRef<{ dotRadius: number; dotSpacing: number; hoverRadius: number }>({
    dotRadius: 1.2,
    dotSpacing: 24,
    hoverRadius: 60,
  });
  const bgColorCacheRef = useRef<string>('');

  /**
   * Determine whether the current background is light or dark by reading
   * the computed background color and calculating relative luminance.
   * Returns 'dark' or 'light' so we can pick fitting dot colors.
   */
  const detectColorScheme = useCallback((): 'light' | 'dark' => {
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim();

    if (!bg) {
      // Fallback: check for .dark class on <html>
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    // Resolve oklch to RGB via temp canvas to get luminance
    const rgb = resolveToRGB(bg);
    if (!rgb) {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    // Relative luminance formula (WCAG)
    const lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    return lum > 128 ? 'light' : 'dark';
  }, []);

  /**
   * Resolve a CSS variable to RGBA. If the color is a CSS variable like
   * `var(--foreground)`, resolve it first. Then apply the given alpha.
   */
  const resolveColor = useCallback((cssColor: string | undefined, alpha: number): string => {
    const colorToUse = cssColor || 'var(--foreground)';

    if (!colorToUse.startsWith('var(')) {
      return resolveToRGBA(colorToUse, alpha);
    }

    const match = colorToUse.match(/var\((--[\w-]+)/);
    if (!match) return `rgba(128, 128, 128, ${alpha})`;

    const varValue = getComputedStyle(document.documentElement)
      .getPropertyValue(match[1])
      .trim();

    if (!varValue) return `rgba(128, 128, 128, ${alpha})`;

    return resolveToRGBA(varValue, alpha);
  }, []);

  /**
   * Get mode-aware default parameters.
   * Light bg → dark dots on light bg, higher opacity for visibility.
   * Dark bg → light dots on dark bg, moderate opacity since contrast is naturally high.
   */
  const getModeParams = useCallback(() => {
    const scheme = detectColorScheme();
    const isLight = scheme === 'light';

    return {
      // Light mode: foreground is dark → higher opacity = darker dots
      // Dark mode: foreground is light → lower opacity = subtle light dots
      baseOpacity: isLight ? 0.10 : 0.10,
      hoverBoostAmt: isLight ? 0.18 : 0.18,
      dotRadius: isLight ? 1.8 : 1.6,
      dotSpacing: isLight ? 28 : 28,
      hoverRadius: isLight ? 72 : 72,
    };
  }, [detectColorScheme]);

  // Build the dot grid
  const buildDots = useCallback((w: number, h: number) => {
    const { dotSpacing: sp, dotRadius: dr } = paramsRef.current;
    const step = sp;
    const cols = Math.floor(w / step);
    const rows = Math.floor(h / step);
    const padX = (w % sp) / 2;
    const padY = (h % sp) / 2;

    const dots: { x: number; y: number }[] = new Array(rows * cols);
    let idx = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots[idx++] = {
          x: padX + col * step + step / 2,
          y: padY + row * step + step / 2,
        };
      }
    }

    dotsRef.current = dots;
  }, []);

  // Check if parent size changed and sync canvas buffer if needed
  const syncSize = useCallback((dpr: number): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const parent = canvas.parentElement;
    if (!parent) return false;

    const rect = parent.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);

    if (sizeRef.current.w === w && sizeRef.current.h === h) return false;

    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);

    canvas.width = bw;
    canvas.height = bh;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sizeRef.current = { w, h };
    buildDots(w, h);
    return true;
  }, [buildDots]);

    // Draw everything
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolve colors/params if cache invalidated (e.g. dark mode toggle)
    // This is done unconditionally but getComputedStyle is called rarely.
    const currentBg = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim();
    if (currentBg && currentBg !== bgColorCacheRef.current) {
      resolvedColorRef.current = null;
      bgColorCacheRef.current = currentBg;
    }

    // Sync size lazily — only if container dimensions changed
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sizeChanged = syncSize(dpr);

    // If size changed, rebuild dot colors/params too (layout shift might occur on theme toggle)
    if (sizeChanged && !resolvedColorRef.current) {
      const modeParams = getModeParams();
      paramsRef.current = {
        dotRadius: modeParams.dotRadius,
        dotSpacing: modeParams.dotSpacing,
        hoverRadius: modeParams.hoverRadius,
      };
      const base = resolveColor(color, opacity ?? modeParams.baseOpacity);
      const hover = resolveColor(color, Math.min((opacity ?? modeParams.baseOpacity) + (hoverBoost ?? modeParams.hoverBoostAmt), 1));
      resolvedColorRef.current = { base, hover };
    } else if (!resolvedColorRef.current) {
      const modeParams = getModeParams();
      paramsRef.current = {
        dotRadius: modeParams.dotRadius,
        dotSpacing: modeParams.dotSpacing,
        hoverRadius: modeParams.hoverRadius,
      };
      const base = resolveColor(color, opacity ?? modeParams.baseOpacity);
      const hover = resolveColor(color, Math.min((opacity ?? modeParams.baseOpacity) + (hoverBoost ?? modeParams.hoverBoostAmt), 1));
      resolvedColorRef.current = { base, hover };
    }

    const dots = dotsRef.current;
    const { w, h } = sizeRef.current;
    if (dots.length === 0 || w === 0 || h === 0) return;

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const { hoverRadius: hr } = paramsRef.current;
    const hrSq = hr * hr;
    const { base: baseColor, hover: hoverColor } = resolvedColorRef.current!;
    const { dotRadius: dr } = paramsRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();

    // Optimization: draw all normal dots in one batch, then hovered dots separately
    let hasHovered = false;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = mx - d.x;
      const dy = my - d.y;
      const isHovered = dx * dx + dy * dy < hrSq;

      if (isHovered) {
        hasHovered = true;
      } else {
        ctx.moveTo(d.x + dr, d.y);
        ctx.arc(d.x, d.y, dr, 0, Math.PI * 2);
      }
    }

    // Draw normal dots
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Draw hovered dots on top with boosted opacity
    if (hasHovered) {
      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = mx - d.x;
        const dy = my - d.y;
        if (dx * dx + dy * dy < hrSq) {
          ctx.moveTo(d.x + dr, d.y);
          ctx.arc(d.x, d.y, dr, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = hoverColor;
      ctx.fill();
    }
  }, [color, opacity, hoverBoost, syncSize, getModeParams, detectColorScheme]);

  // Schedule a single paint frame — avoids the continuous rAF loop
  const schedulePaint = useCallback(() => {
    if (rafIdRef.current) return; // Already has a paint scheduled
    rafIdRef.current = requestAnimationFrame(() => {
      paint();
      rafIdRef.current = null;
      needsPaintRef.current = false;
    });
  }, [paint]);

  // Resize observer for when panels collapse/expand
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      // Invalidate cache so syncSize rebuilds dots on next paint
      sizeRef.current = { w: 0, h: 0 };
      needsPaintRef.current = true;
      schedulePaint();
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [schedulePaint]);

  // Initial setup — mouse tracking, event-driven painting (no continuous rAF).
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const parent = canvasRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();

      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      mouseRef.current.x = localX;
      mouseRef.current.y = localY;
      needsPaintRef.current = true;

      // Schedule a single paint on mouse move
      schedulePaint();
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      needsPaintRef.current = true;
      schedulePaint();
    };

    // Initial paint
    schedulePaint();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [schedulePaint]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
});

DotGridBackground.displayName = 'DotGridBackground';
export default DotGridBackground;

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

/**
 * Resolve any CSS color string to rgba by rendering it on a temp canvas.
 */
function resolveToRGBA(colorStr: string, alpha: number): string {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return `rgba(128, 128, 128, ${alpha})`;

  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;

  return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${alpha})`;
}

/**
 * Resolve any CSS color string to an RGB tuple [r, g, b] (0-255).
 */
function resolveToRGB(colorStr: string): [number, number, number] | null {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;

  return [pixel[0], pixel[1], pixel[2]];
}
