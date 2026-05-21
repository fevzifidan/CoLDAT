export type LogLevel = 'debug' | 'info' | 'log' | 'warning' | 'error' | 'fatal';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
}