// src/App.tsx
import './App.css';
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from "@/components/ui/sonner";
import ApiKeysPage from "./features/api-keys/ApiKeysPage";
import SyntheticPage from "./features/synthetic/SyntheticPage";

import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx';
import { ConfirmProvider } from './shared/services/confirmation/ConfirmContext.js';
import { BannerProvider } from './components/custom/GlobalBanner/BannerContext.js';
import { GlobalBanner } from './components/custom/GlobalBanner/GlobalBanner.js';
import { GlobalKeyboardListener } from './shared/components/GlobalKeyboardListener';

// Upload Manager
import { UploadManager } from '@/features/upload_manager';

// 🎯 DÜZELTME: Named export olduğu için süslü parantez { ProfilePage } ile import ettik
import ProfilePage from '@/features/accounts/ProfilePagers.js';

import DashboardLayout from '@/features/core/layouts/DashboardLayout';
import DashboardHome from '@/features/dashboard/DashboardHome';
import ProjectDetailPage from '@/features/projects/ProjectDetailPage';
import AnnotationPage from '@/features/annotation/AnnotationPage';
import Login from "@/features/auth/Login/Login";
import Register from "@/features/auth/Register/Register";

import TasksPage from '@/features/tasks/TasksPage';
import DatasetsPage from '@/features/datasets/DatasetsPage';
import { ProjectDatasetsPage } from '@/features/projects/ProjectDatasetsPage'; 
import ProjectsPage from '@/features/projects/ProjectsPage';
import ViewerPage from '@/features/viewer/ViewerPage';
import { VerificationPage } from '@/features/auth/EmailVerification/EmailVerification';
import { ForgotPasswordPage } from '@/features/auth/ForgotPassword/ForgotPassword';
import { PasswordResetPage } from '@/features/auth/ResetPassword/ResetPassword';
import AccountNotVerifiedPage from '@/features/auth/AccountNotVerified/AccountNotVerified';

function App() {
  return (
    <>
      <UploadManager />
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-white font-mono">Yükleniyor...</div>}>
        <BrowserRouter>
          <BannerProvider>
            <GlobalBanner />
            <GlobalKeyboardListener />
            <ConfirmProvider>
              <AuthProvider>
                <AxiosInterceptorSetup />
                <Toaster position="top-right" richColors />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/annotate/:taskId/:imageId?" element={<AnnotationPage />} />
                  <Route path="/view/:taskId/:imageId?" element={<ViewerPage />} />
                  <Route path="/verify-email" element={<VerificationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<PasswordResetPage />} />
                  <Route path="/account-not-verified" element={<AccountNotVerifiedPage />} />
                  <Route path="/*" element = {
                    <DashboardLayout>
                      <Routes>
                        <Route path="/" element={<DashboardHome />} />

                        {/* Ana Sayfa */}
                        <Route path="/projects" element={<ProjectsPage />} />
                        
                        <Route path="/projects/:projectId/datasets" element={<ProjectDatasetsPage />} />
                        
                        {/* Sol menü veya doğrudan erişim için genel Datasets rotası */}
                        <Route path="/datasets" element={<DatasetsPage />} />

                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/api-keys" element={<ApiKeysPage />} />
                        
                        {/* Sol tarafta tıklandığında yüklenecek alan */}
                        <Route path="/synthetic" element={<SyntheticPage />} />

                        {/* 🎯 HESAP AYARLARI: DashboardLayout altında çalışacak profil rotamız */}
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Detay sayfası */}
                        <Route path="/projects/:id" element={<ProjectDetailPage />} />
                        <Route path="*" element={<div className="p-8 text-center font-mono text-white">404 | Page Not Found</div>} />
                      </Routes>
                    </DashboardLayout>
                  } />
                </Routes>
              </AuthProvider>
            </ConfirmProvider>
          </BannerProvider>
        </BrowserRouter>
      </Suspense>
    </>
  );
}

export default App;