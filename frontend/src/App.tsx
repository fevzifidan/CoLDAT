import './App.css';
// import { useTranslation } from "react-i18next";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/custom/ProtectedRoute/ProtectedRoute';
import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx';

function App() {
  // const { t, i18n } = useTranslation();

  return (
    <BrowserRouter>
      <AuthProvider>
        <AxiosInterceptorSetup />
        <Toaster position="top-right" richColors />

        <Routes>
          <></>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
