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
 */
const DotGridBackground = memo(({
  dotRadius = 0.6,
  dotSpacing = 20,
  hoverRadius = 50,
  color = 'var(--foreground)',
  opacity = 0.07,
  hoverBoost = 0.18,
}: DotGridBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<{ x: number; y: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafIdRef = useRef<number | null>(null);
  const needsPaintRef = useRef(true);

  /**
   * Resolve a CSS variable to an RGBA string the Canvas2D API can use.
   */
  const resolveColor = useCallback((cssColor: string, alpha: number): string => {
    if (!cssColor.startsWith('var(')) {
      return cssColor;
    }

    const match = cssColor.match(/var\((--[\w-]+)/);
    if (!match) return `rgba(128, 128, 128, ${alpha})`;

    const varValue = getComputedStyle(document.documentElement)
      .getPropertyValue(match[1])
      .trim();

    if (!varValue) return `rgba(128, 128, 128, ${alpha})`;

    return resolveToRGBA(varValue, alpha);
  }, []);

  // Build the dot grid
  const buildDots = useCallback((w: number, h: number) => {
    const step = dotSpacing;
    const cols = Math.floor(w / step);
    const rows = Math.floor(h / step);
    const padX = (w % step) / 2;
    const padY = (h % step) / 2;

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
  }, [dotSpacing]);

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

    // Sync size every frame — catches layout shifts from panel animations
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    syncSize(dpr);

    const dots = dotsRef.current;
    const { w, h } = sizeRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const hrSq = hoverRadius * hoverRadius;

    const baseColor = resolveColor(color, opacity);
    const hoverColor = resolveColor(color, Math.min(opacity + hoverBoost, 1));

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
        ctx.moveTo(d.x + dotRadius, d.y);
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
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
          ctx.moveTo(d.x + dotRadius, d.y);
          ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = hoverColor;
      ctx.fill();
    }
  }, [dotRadius, hoverRadius, color, opacity, hoverBoost, resolveColor, syncSize]);

  // Animation loop — only paints when needed
  const tick = useCallback(() => {
    if (needsPaintRef.current) {
      paint();
      needsPaintRef.current = false;
    }
    rafIdRef.current = requestAnimationFrame(tick);
  }, [paint]);

  // Initial setup — mouse tracking and animation loop.
  // Canvas size is synced every frame inside paint() via syncSize().
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const parent = canvasRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();

      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      needsPaintRef.current = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      needsPaintRef.current = true;
    };

    rafIdRef.current = requestAnimationFrame(tick);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [tick]);

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
  const computed = ctx.fillStyle;

  const rgbaMatch = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  }

  return computed;
}
