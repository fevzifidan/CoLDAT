import './App.css';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx';
import { ConfirmProvider } from './shared/services/confirmation/ConfirmContext.js';
import { BannerProvider } from './components/custom/GlobalBanner/BannerContext.js';
import { GlobalBanner } from './components/custom/GlobalBanner/GlobalBanner.js';

import LoginPage from './test/Login.js';

function App() {
  const { i18n, ready } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = () => {
      // Get browser's language ('en-US' -> 'en')
      const newLang = navigator.language.split('-')[0]; 
      i18n.changeLanguage(newLang);
    };

    // Listen for browser language change event
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      // Remove listener when component removed
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [i18n]);

  // Do not render anything until i18n is completely initialized
  if (!ready) {
    return null;
  }

  return (
    <BrowserRouter>
      <BannerProvider>
        <GlobalBanner />
        <ConfirmProvider>
          <AuthProvider>
            <AxiosInterceptorSetup />
            <Toaster position="top-right" richColors />

            <Routes>
              <></>
              <Route path='/' element={<><LoginPage/></>} />
            </Routes>
          </AuthProvider>
        </ConfirmProvider>
      </BannerProvider>
    </BrowserRouter>
  )
}

export default App
