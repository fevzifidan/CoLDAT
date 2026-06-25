// src/features/landing/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // 🎯 Yönlendirmeler için eklendi
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { t } = useTranslation(["common"]);
  return (
    <nav className="border-b border-neutral-100 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          
          {/* 🎯 DÜZELTME: Yazı yerine public/images/logo.png yerleştirildi */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/images/logo.png" 
              alt="CoLDAT Logo" 
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Eğer public/images/logo.png henüz oluşturulmadıysa kırık görsel kalmasın diye fallback metin:
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.brand-fallback')) {
                  const span = document.createElement('span');
                  span.className = 'brand-fallback text-xl font-bold text-red-600';
                  span.innerText = 'CoLDAT';
                  parent.appendChild(span);
                }
              }}
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {/* 🎯 DÜZELTME: Features ve Integrations tableri silindi, sadece Platform kaldı */}
            {['Platform'].map((link) => (
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
          {/* 🎯 DÜZELTME: Sign In butonu -> /login sayfasına yönlendirildi */}
          <Link 
            to="/login" 
            className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Sign In
          </Link>
          
          {/* 🎯 DÜZELTME: Get Started butonu -> /register sayfasına yönlendirildi */}
          <Link to="/register">
            <Button className="bg-red-700 hover:bg-red-800 text-white rounded-md text-sm px-4 py-2 font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};