import './App.css';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar ve Layoutlar
import ProjectDetailPage from './features/projects/ProjectDetailPage';
import DashboardHome from './features/projects/DashboardHome';
import DashboardLayout from './components/layouts/DashboardLayout';
import Login from "./features/auth/Login/Login";
import Register from "./features/auth/Register/Register";

// Context ve Interceptorlar
import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx';
import { ConfirmProvider } from './shared/services/confirmation/ConfirmContext.js';
import { BannerProvider } from './components/custom/GlobalBanner/BannerContext.js';
import { GlobalBanner } from './components/custom/GlobalBanner/GlobalBanner.js';

function App() {
  const { i18n, ready } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = navigator.language.split('-')[0]; 
      i18n.changeLanguage(newLang);
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [i18n]);

  if (!ready) return <div className="flex h-screen items-center justify-center text-white font-mono">Yükleniyor...</div>;

  return (
    <BrowserRouter>
      <BannerProvider>
        <GlobalBanner />
        <ConfirmProvider>
          <AuthProvider>
            <AxiosInterceptorSetup />
            <Toaster position="top-right" richColors />
            
            <Routes>
              {/* 1. PUBLIC ROUTES (Login, Register vb. Layout dışı kalmalı) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 2. PROTECTED DASHBOARD ROUTES (DashboardLayout sarmalıyor) */}
              <Route element={<DashboardLayout />}>
                {/* Ana sayfa açıldığında doğrudan dashboard'a yönlendirir */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                {/* Diğer sayfaların (Settings, Datasets vb.) buraya gelecek */}
              </Route>

              {/* 3. 404 PAGE */}
              <Route path="*" element={<div className="p-8 text-center font-mono text-white">404 | Page Not Found</div>} />
            </Routes>

          </AuthProvider>
        </ConfirmProvider>
      </BannerProvider>
    </BrowserRouter>
  );
}

export default App;