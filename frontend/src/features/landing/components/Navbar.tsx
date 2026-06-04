// src/features/landing/components/Navbar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const {t} = useTranslation(["common"])
  return (
    <nav className="border-b border-neutral-100 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            <span className="text-red-600 font-extrabold">{t("common:brand")}</span>
          </span>
          <div className="hidden md:flex items-center gap-6">
            {['Platform', 'Features', 'Integrations'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`} 
                className="text-sm font-medium text-neutral-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 dark:text-zinc-300 dark:hover:text-white">
            Sign In
          </button>
          <Button className="bg-red-700 hover:bg-red-800 text-white rounded-md text-sm px-4 py-2 font-medium">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};