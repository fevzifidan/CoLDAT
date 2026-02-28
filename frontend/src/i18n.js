import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Static language files
import trApiService from './assets/static/locales/tr/apiService.json';
import enApiService from './assets/static/locales/en/apiService.json';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },

    resources: {
      tr: {apiService: trApiService},
      en: {apiService: enApiService}
    },

    partialBundledLanguages: true,

    backend: {
      // Çeviri dosyalarının yolu.
      // {{lng}} -> dil kodu (tr, en)
      // {{ns}}  -> dosya adı (common, auth)
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },

    debug: false,

    interpolation: {
      escapeValue: false, // React XSS koruması olduğu için false
    },

    // React Suspense ile entegrasyon
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    }
  });

export default i18n;