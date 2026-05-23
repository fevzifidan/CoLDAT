import "./i18n";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./providers/ThemeProvider/ThemeProvider.tsx";
import * as Sentry from "@sentry/react";

const SEVERITY_NUMBERS = {
  debug: 10,
  info: 20,
  log: 30,
  warning: 40,
  error: 50,
  fatal: 60,
};

const LOG_THRESHOLD = parseInt(import.meta.env.VITE_LOG_THRESHOLD || "40", 10);

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  beforeSend(event, hint) {
    const eventLevel = event.level || "error"; 
    
    const eventLevelValue = SEVERITY_NUMBERS[eventLevel] || 40;

    // Gelen logun değeri, belirlenen eşiğin altındaysa Sentry'ye gönderme (suppress et)
    if (eventLevelValue < LOG_THRESHOLD) {
      return null; // Bu log iptal edilir ve kotayı etkilemez
    }

    return event; // Eşiğe eşit veya büyükse Sentry'ye gönderilir
  },

  integrations: [
    // 1. Tarayıcı izlemesini aktif ediyoruz
    Sentry.browserTracingIntegration(),
    Sentry.httpClientIntegration({
      failedRequestStatusCodes: [[400, 599]],
    }),
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

