/**
 * SamProcessingOverlay.tsx
 *
 * Pure HTML/CSS overlay that sits ON TOP of the Konva canvas container.
 *
 * ─── Visibility ─────────────────────────────────────────────────────────────
 * This overlay is ONLY visible when samStore.status is NOT 'idle' and NOT 'ready'
 * (e.g., during 'computing_local', 'downloading_embedding', 'checking_backend',
 * 'checking_cache'). When status is 'idle' or 'ready', the overlay is completely
 * hidden and does not block interaction with the canvas.
 *
 * ─── Visuals ────────────────────────────────────────────────────────────────
 * - Semi-transparent dark / blurred backdrop
 * - Magic wand icon (SVG) floating above the text
 * - "Image Processing for SAM..." with CSS keyframe breathing animation
 * - Optional: Download progress bar (visible when status === 'downloading_embedding')
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────
 *   <div className="relative w-full h-full">
 *     <CanvasContainer ... />
 *     <SamProcessingOverlay />
 *   </div>
 */

import React from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import type { SAMStatus } from '../../types/annotation.types';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Statuses during which the overlay should be visible */
const VISIBLE_STATUSES: ReadonlySet<SAMStatus> = new Set([
  'checking_cache',
  'checking_backend',
  'downloading_embedding',
  'computing_local',
]);

/** Human-readable labels for each status */
const STATUS_LABELS: Record<SAMStatus, string> = {
  idle: '',
  checking_cache: 'Checking local cache...',
  checking_backend: 'Checking for precomputed embedding...',
  downloading_embedding: 'Downloading SAM embedding from server...',
  computing_local: 'Computing SAM embedding locally...',
  ready: '',
};

// ─── Styles ──────────────────────────────────────────────────────────────────

/**
 * Inject the @keyframes style block once into the document head.
 * Uses a module-level flag to ensure it's only added once regardless
 * of how many instances of this component are mounted.
 */
let animationsInjected = false;

function injectAnimations(): void {
  if (animationsInjected) return;
  animationsInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes sam-breathe {
      0%, 100% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.04);
      }
    }

    @keyframes sam-float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      25% {
        transform: translateY(-8px) rotate(-4deg);
      }
      50% {
        transform: translateY(-4px) rotate(0deg);
      }
      75% {
        transform: translateY(-8px) rotate(4deg);
      }
    }

    @keyframes sam-sparkle {
      0%, 100% {
        opacity: 0;
        transform: scale(0.5);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }

    .sam-overlay {
      position: absolute;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      pointer-events: none;
    }

    .sam-overlay-wand {
      animation: sam-float 2.5s ease-in-out infinite;
      font-size: 3rem;
      line-height: 1;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
    }

    .sam-overlay-text {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      animation: sam-breathe 3s ease-in-out infinite;
      letter-spacing: 0.02em;
    }

    .sam-overlay-subtext {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.5rem;
      letter-spacing: 0.05em;
    }

    .sam-overlay-progress-container {
      margin-top: 1.25rem;
      width: 200px;
      height: 4px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      overflow: hidden;
    }

    .sam-overlay-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
      border-radius: 9999px;
      transition: width 0.3s ease;
      width: 0%;
    }

    .sam-overlay-sparkle {
      position: absolute;
      font-size: 1rem;
      animation: sam-sparkle 1.5s ease-in-out infinite;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

// ─── Magic Wand SVG Icon ─────────────────────────────────────────────────────

const MagicWandIcon: React.FC = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(255, 255, 255, 0.9)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="sam-overlay-wand"
  >
    {/* Wand handle */}
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.5 5.5L19 4" />
    <path d="M17.5 12.5L19 14" />
    {/* Wand stick */}
    <line x1="1" y1="20" x2="13" y2="8" />
    {/* Star sparkle */}
    <path d="M9 3l1 2 2 .5-2 .5-1 2-.5-2-2-.5 2-.5z" />
    <path d="M6 12l.5 1 1 .25-1 .25-.5 1-.25-1-1-.25 1-.25z" />
    {/* Tip */}
    <circle cx="13.5" cy="7.5" r="0.5" fill="rgba(255, 255, 255, 0.9)" stroke="none" />
  </svg>
);

// ─── Sparkle Decorations ─────────────────────────────────────────────────────

const SPARKLE_POSITIONS = [
  { top: '20%', left: '15%', delay: '0s' },
  { top: '15%', right: '20%', delay: '0.5s' },
  { bottom: '25%', left: '25%', delay: '1s' },
  { bottom: '20%', right: '15%', delay: '0.3s' },
  { top: '40%', right: '10%', delay: '0.8s' },
  { top: '60%', left: '10%', delay: '0.2s' },
];

const Sparkles: React.FC = () => (
  <>
    {SPARKLE_POSITIONS.map((pos, i) => (
      <span
        key={i}
        className="sam-overlay-sparkle"
        style={{
          top: pos.top,
          left: pos.left,
          right: (pos as any).right,
          bottom: (pos as any).bottom,
          animationDelay: pos.delay,
        }}
      >
        ✦
      </span>
    ))}
  </>
);

// ─── Progress Bar ────────────────────────────────────────────────────────────

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = React.memo(({ progress }) => (
  <div className="sam-overlay-progress-container">
    <div
      className="sam-overlay-progress-bar"
      style={{ width: `${Math.round(progress)}%` }}
    />
  </div>
));

ProgressBar.displayName = 'ProgressBar';

// ─── Overlay Content (per status) ───────────────────────────────────────────

interface OverlayContentProps {
  status: SAMStatus;
  progress: number;
}

const OverlayContent: React.FC<OverlayContentProps> = React.memo(({ status, progress }) => {
  const label = STATUS_LABELS[status] || 'Processing...';

  return (
    <>
      <Sparkles />
      <MagicWandIcon />
      <div className="sam-overlay-text">{label}</div>
      {status === 'downloading_embedding' && (
        <>
          <div className="sam-overlay-subtext">{Math.round(progress)}%</div>
          <ProgressBar progress={progress} />
        </>
      )}
      {status === 'computing_local' && (
        <div className="sam-overlay-subtext">This may take a moment...</div>
      )}
    </>
  );
});

OverlayContent.displayName = 'OverlayContent';

// ─── Main Component ─────────────────────────────────────────────────────────

/**
 * SamProcessingOverlay
 *
 * A full-screen overlay that displays progress/status information during
 * the SAM embedding initialization lifecycle.
 *
 * This component should be rendered as an absolutely-positioned sibling
 * of the Konva canvas container, wrapped in a `position: relative` div.
 *
 * The overlay is transparent to pointer events (pointer-events: none)
 * when visible, so the user can still interact with the canvas if needed.
 * However, in practice, interactions are blocked by the orchestrator during
 * non-'ready' states.
 */
export const SamProcessingOverlay: React.FC = React.memo(() => {
  // Inject the animation keyframes once
  React.useEffect(() => {
    injectAnimations();
  }, []);

  const { samStatus, samDownloadProgress } = useAppStore(
    useShallow((state) => ({
      samStatus: state.samStatus,
      samDownloadProgress: state.samDownloadProgress,
    }))
  );

  const isVisible = VISIBLE_STATUSES.has(samStatus);

  if (!isVisible) return null;

  return (
    <div className="sam-overlay">
      <OverlayContent status={samStatus} progress={samDownloadProgress} />
    </div>
  );
});

SamProcessingOverlay.displayName = 'SamProcessingOverlay';
