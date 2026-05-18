/**
 * S3 Upload Manager — Barrel Exports
 *
 * Dışa aktarımlar:
 * - UploadManager: ana birleştirici bileşen (App.tsx'e eklenecek)
 * - Alt bileşenler: ihtiyaç duyulursa izole olarak kullanılabilir
 * - Store slice: test veya diğer bileşenler tarafından kullanılabilir
 * - Config ve utils: genişletme/geliştirme için
 * - UploadManagerDevTools: sadece dev modunda görünen geliştirme aracı
 */
export { default as UploadManager } from './UploadManager';
export { default as MiniIsland } from './components/MiniIsland';
export { default as ExpandedPanel } from './components/ExpandedPanel';
export { default as FileItem } from './components/FileItem';
export { default as UploadManagerDevTools } from './components/UploadManagerDevTools';
export { createUploadManagerSlice } from './store/uploadManagerSlice';
export type { UploadManagerState } from './store/uploadManagerSlice';
export { STATUS_DISPLAY_CONFIG } from './config/statusDisplayConfig';
export type { StatusDisplayConfig } from './config/statusDisplayConfig';
export { getFileTypeIcon } from './config/fileTypeIconConfig';
export { getAggregateStatus, formatFileSize } from './utils/aggregateStatus';
export type { AggregateStatus, AggregateMode } from './utils/aggregateStatus';
