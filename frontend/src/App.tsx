import './App.css';
// import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes } from 'react-router-dom';
import AxiosInterceptorSetup from './components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup';

function App() {
  // const { t, i18n } = useTranslation();

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AxiosInterceptorSetup />
        <Routes>
          <></>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
