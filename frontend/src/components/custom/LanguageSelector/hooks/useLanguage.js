import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = (onLanguageChangeCallback) => {
  const { i18n, t } = useTranslation(["component"]);

  // Mevcut dili güvenli bir şekilde belirle
  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'tr';

  // Dil Değiştirme Fonksiyonu
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    
    if (onLanguageChangeCallback) {
      onLanguageChangeCallback();
    }
  };

  // Sekmeler Arası Senkronizasyon (Canlı)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Başka bir sekmede 'language' değişirse bu sekmede de güncelle
      if (e.key === 'language' && e.newValue) {
        i18n.changeLanguage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [i18n]);

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};