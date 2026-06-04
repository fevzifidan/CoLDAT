// src/features/landing/components/Footer.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const {t} = useTranslation(["common"]);
  return (
    <footer className="border-t border-neutral-100 dark:border-zinc-900 bg-neutral-50/50 dark:bg-zinc-950/50 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            <span className="text-red-600 font-extrabold">{t("common:brand")}</span>
          </span>
          <p className="text-xs text-neutral-500 dark:text-zinc-500 max-w-sm leading-relaxed">
            Precision engineering for computer vision and machine learning teams.
          </p>
          <p className="text-[10px] font-mono text-neutral-400 dark:text-zinc-600">
            © {new Date().getFullYear()} {t("common:footer.copyright")}
          </p>
        </div>
        <div className="flex flex-wrap items-center md:justify-end gap-x-6 gap-y-2">
          {['Documentation', 'Privacy Policy', 'Terms of Service', 'Github', 'Status'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};