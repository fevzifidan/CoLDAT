import './App.css';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx';

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
      <AuthProvider>
        <AxiosInterceptorSetup />
        <Toaster position="top-right" richColors />

        <Routes>
          <></>
          <Route path='/' element={<></>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
