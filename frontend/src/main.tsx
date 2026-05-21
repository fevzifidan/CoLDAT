import "./i18n";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./providers/ThemeProvider/ThemeProvider.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    // 1. Tarayıcı izlemesini aktif ediyoruz
    Sentry.browserTracingIntegration(),
  ],
  // 2. Sentry'nin otomatik Trace ID (sentry-trace) ekleyeceği backend adreslerimiz
  tracePropagationTargets: [
    "localhost", // Yerel geliştirme ortamı için
    /^https:\/\/api\.coldat\.com/, // Canlı ortam API adresiniz (RegEx olarak)
  ],
  // 3. İzleme oranını belirliyoruz (1.0 = tüm işlemleri kaydet)
  tracesSampleRate: 1.0,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

