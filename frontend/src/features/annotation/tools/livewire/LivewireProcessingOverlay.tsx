import React from 'react';
import { useAppStore } from '@/store/hooks/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Magnet } from 'lucide-react';

let animationsInjected = false;

function injectLivewireAnimations(): void {
  if (animationsInjected) return;
  animationsInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes livewire-breathe {
      0%, 100% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.03);
      }
    }

    @keyframes livewire-float {
      0%, 100% {
        transform: translateY(0px) rotate(45deg);
      }
      50% {
        transform: translateY(-8px) rotate(48deg);
      }
    }

    .livewire-overlay {
      position: absolute;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      pointer-events: none;
    }

    .livewire-overlay-magnet {
      animation: livewire-float 2s ease-in-out infinite;
      color: #34d399; /* emerald-400 */
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.4));
    }

    .livewire-overlay-text {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      animation: livewire-breathe 2.5s ease-in-out infinite;
      letter-spacing: 0.02em;
    }

    .livewire-overlay-subtext {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.5rem;
      letter-spacing: 0.05em;
      text-transform: capitalize;
    }
  `;
  document.head.appendChild(style);
}

export const LivewireProcessingOverlay: React.FC = React.memo(() => {
  React.useEffect(() => {
    injectLivewireAnimations();
  }, []);

  const { livewireStatus, livewireProgress } = useAppStore(
    useShallow((state) => ({
      livewireStatus: state.livewireStatus,
      livewireProgress: state.livewireProgress,
    }))
  );

  if (livewireStatus !== 'preprocessing') return null;

  return (
    <div className="livewire-overlay">
      <div className="livewire-overlay-magnet">
        <Magnet size={48} />
      </div>
      <div className="livewire-overlay-text">Image Preprocessing for Livewire...</div>
      <div className="livewire-overlay-subtext">
        {livewireProgress || 'Analyzing image structures...'}
      </div>
    </div>
  );
});

LivewireProcessingOverlay.displayName = 'LivewireProcessingOverlay';
