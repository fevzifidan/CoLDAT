import './App.css';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import ProjectDetailPage from './features/auth/Login/layouts/project-detail-page';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { projects } from './shared/utils/projectsData'; 
import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx';
import { ConfirmProvider } from './shared/services/confirmation/ConfirmContext.js';
import { BannerProvider } from './components/custom/GlobalBanner/BannerContext.js';
import { GlobalBanner } from './components/custom/GlobalBanner/GlobalBanner.js';
import DashboardLayout from './features/auth/Login/layouts/dashboard-layout';
import Login from "./features/auth/Login/Login";
import Register from "./features/auth/Register/Register";

const DashboardHome = () => {
  const navigate = useNavigate();
  // 1. Çeviri fonksiyonunu (t) buraya ekledik
  const { t } = useTranslation(); 
  
  const getBadgeVariant = (status: string) => {
    if (status === "Completed") return "default";
    if (status === "In Progress") return "secondary";
    return "outline";
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">CoLDAT project current progress.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-all border-t-2 border-t-primary/20">
            <CardHeader className="pb-3 text-left">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-bold leading-tight">{project.name}</CardTitle>
                <Badge variant={getBadgeVariant(project.status) as any}>
                   {project.status === "In Progress" ? t('dashboard.in_progress') : project.status}
                </Badge>
              </div>
              <CardDescription>{project.task}</CardDescription>
            </CardHeader>
            <CardContent className="text-left py-4">
              <div className="text-4xl font-extrabold tracking-tighter">{project.count}</div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                {t('dashboard.processed_files')}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-xs font-semibold" 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                OPEN PROJECT
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};


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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardHome />} />
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
  );
}

export default App;