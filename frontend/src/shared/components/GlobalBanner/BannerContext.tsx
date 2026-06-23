// BannerContext.tsx
"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';

type BannerVariant = "default" | "destructive" | "info" | "warning";

interface BannerState {
  show: boolean;
  text: string;
  icon?: React.ReactNode;
  variant?: BannerVariant;
  className?: string;
}

interface BannerContextType {
  showBanner: (text: string, icon?: React.ReactNode, variant?: BannerVariant, className?: string) => void;
  hideBanner: () => void;
  banner: BannerState;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: ReactNode }) => {
  const [banner, setBanner] = useState<BannerState>({
    show: false,
    text: '',
    variant: 'default'
  });

  const showBanner = (text: string, icon?: React.ReactNode, variant: BannerVariant = 'default', className?:string) => {
    setBanner({ show: true, text, icon, variant, className });
  };

  const hideBanner = () => setBanner((prev) => ({ ...prev, show: false }));

  return (
    <BannerContext.Provider value={{ banner, showBanner, hideBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (!context) throw new Error("useBanner must be used within BannerProvider");
  return context;
};