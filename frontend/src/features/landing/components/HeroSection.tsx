// src/features/landing/components/HeroSection.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-12 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Red accent grid background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f3e8e8_1px,transparent_1px),linear-gradient(to_bottom,#f3e8e8_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1313_1px,transparent_1px),linear-gradient(to_bottom,#1f1313_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-200 bg-red-50/50 dark:border-red-950/50 dark:bg-red-950/20 mb-8 animate-fade-in">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
        <span className="text-[10px] font-mono font-bold tracking-wider text-red-700 dark:text-red-400 uppercase">
          ✦ v2.0 Engine Now Live
        </span>
      </div>

      {/* Main Headlines */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-white max-w-4xl leading-[1.15] mb-6 px-4">
        Computer Vision <br />
        <span className="italic font-serif text-red-600 dark:text-red-500 font-black">Training, Simplified.</span>
      </h1>

      <p className="text-neutral-600 dark:text-zinc-400 max-w-2xl text-base md:text-lg mb-10 px-4 leading-relaxed">
        High-precision labeling tools powered by AI. Experience the future of data annotation with sub-pixel accuracy and seamless team collaboration.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Button className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-semibold py-6 px-8 rounded-lg shadow-lg shadow-red-700/10 transition-all">
          Start Annotating
        </Button>
        <Button variant="outline" className="w-full sm:w-auto border-neutral-300 dark:border-zinc-800 text-neutral-800 dark:text-zinc-200 hover:bg-neutral-50 dark:hover:bg-zinc-900 py-6 px-8 rounded-lg gap-2">
          <Play className="h-4 w-4 fill-current" /> Watch Demo
        </Button>
      </div>

      {/* Status Bar */}
      <div className="w-full max-w-7xl px-6 grid grid-cols-2 border-t border-b border-neutral-200/60 dark:border-zinc-800/80 py-4 font-mono text-[10px] md:text-xs text-neutral-500 dark:text-zinc-500">
        <div className="text-left flex items-center gap-1">
          <span className="font-semibold text-neutral-700 dark:text-zinc-400">STATUS</span>
          <span className="text-neutral-400 dark:text-zinc-600">//</span>
          <span>SYSTEM_READY</span>
          <span className="text-neutral-400 dark:text-zinc-600">//</span>
          <span className="text-emerald-600 dark:text-emerald-500">0.042ms</span>
        </div>
        <div className="text-right flex items-center justify-end gap-1">
          <span className="font-semibold text-neutral-700 dark:text-zinc-400">COORDINATES</span>
          <span className="text-neutral-400 dark:text-zinc-600">//</span>
          <span>LAT: 37.7749</span>
          <span className="text-neutral-400 dark:text-zinc-600">//</span>
          <span>LNG: -122.4194</span>
        </div>
      </div>
    </section>
  );
};