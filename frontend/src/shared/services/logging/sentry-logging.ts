import * as Sentry from '@sentry/react';
import type { SentryConfig, LogLevel } from './types';

export class SentryLogger {

  public static init(config: SentryConfig) {
    // Sentry zaten başka bir katmanda başlatılmışsa tekrar başlatmıyoruz
    if (Sentry.isInitialized()) return; 

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      defaultIntegrations: false,
      integrations: [
        Sentry.httpContextIntegration(),
      ],
      tracesSampleRate: 0.0,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.0,
    });
  }

  /**
   * Sentry'nin o anki aktif, otomatik ürettiği Trace ID'sini döner.
   */
  public static getTraceId(): string {
    if (!Sentry.isInitialized()) return ''; // Yerleşik durum kontrolü

    const traceData = Sentry.getTraceData(); 
    const sentryTraceHeader = traceData['sentry-trace']; 
    
    if (sentryTraceHeader) {
      return sentryTraceHeader.split('-')[0]; 
    }
    return '';
  }

  /**
   * Backend isteklerine doğrudan ekleyebileceğiniz header bilgilerini döner.
   */
  public static getTraceHeaders(): Record<string, string> {
    if (!Sentry.isInitialized()) return {}; // Yerleşik durum kontrolü

    const traceData = Sentry.getTraceData(); 
    const sentryTraceHeader = traceData['sentry-trace'] || '';
    const baggageHeader = traceData['baggage'] || '';
    const traceId = sentryTraceHeader.split('-')[0] || '';

    return {
      'sentry-trace': sentryTraceHeader,
      'baggage': baggageHeader,
      'X-Trace-Id': traceId,
    };
  }

  /**
   * LOCAL SCOPE UYUMU:
   */
  public static startNewTraceScope<T>(callback: () => T): T {
    if (!Sentry.isInitialized()) return callback(); // Yerleşik durum kontrolü
    return Sentry.startNewTrace(callback); 
  }

  public static info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  public static warn(message: string, context?: Record<string, any>) {
    this.log('warning', message, context);
  }

  public static error(messageOrError: string | Error, context?: Record<string, any>) {
    if (messageOrError instanceof Error) {
      this.captureException(messageOrError, context);
    } else {
      this.captureException(new Error(messageOrError), context);
    }
  }

  private static captureException(error: Error, context?: Record<string, any>) {
    if (!Sentry.isInitialized()) { // Yerleşik durum kontrolü
      // Eğer Sentry gerçekten hiç başlatılmadıysa geliştiriciyi konsolda uyarıyoruz
      console.warn('[SentryLogger] Sentry başlatılmadığı için exception gönderilemedi:', error, context);
      return;
    }
    
    Sentry.captureException(error, {
      extra: context,
    });
  }

  public static debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  private static log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!Sentry.isInitialized()) { // Yerleşik durum kontrolü
      console.warn(`[SentryLogger] Sentry başlatılmadığı için log gönderilemedi: [${level}] ${message}`, context);
      return;
    }

    Sentry.captureMessage(message, {
      level: level as Sentry.SeverityLevel,
      extra: context,
    });
  }
}