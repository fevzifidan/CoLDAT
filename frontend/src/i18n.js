import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    ns: ['common', 'auth'],
    defaultNS: 'common',

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
      useSuspense: false,  // FALSE: Fixes modal styling bug on first render
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    }
  });

export default i18n;