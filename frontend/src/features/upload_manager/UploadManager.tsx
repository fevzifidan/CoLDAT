/**
 * UploadManager — S3 Upload Manager'ın ana birleştirici bileşeni.
 *
 * Sadece iki alt bileşeni render eder:
 * 1. MiniIsland (collapsed pill → sağ alt köşe)
 * 2. ExpandedPanel (non-modal side drawer → sağ taraf)
 *
 * Bu bileşen "aptal" (dumb) bir kabuktur:
 * - Hiçbir state yönetmez
 * - Hiçbir mantık barındırmaz
 * - Sadece alt bileşenleri mount eder
 * - Tüm görseller/config/çeviri alt bileşenlerde yönetilir
 *
 * ÖNEMLİ (Route Değişimi Kararlılığı):
 * UploadManager, App.tsx'te hem Suspense hem de BrowserRouter DIŞINDA
 * mount edilir. Böylece:
 * - Sayfa değişimlerinde hiçbir alt bileşen unmount olmaz
 * - Suspense fallback gösterildiğinde dahi DOM'da kalır
 * - Tüm subscription'lar (useUploads) ve state'ler korunur
 *
 * Alt bileşenler (MiniIsland, ExpandedPanel) "return null" yerine
 * opacity/translateX ile gizlenir, böylece her zaman React ağacında
 * kalır ve hiçbir state/memo/subscription kaybetmez.
 *
 * Tüm alt bileşenler yüksek z-index değerleri (z-[9998] / z-[9999]) ile
 * her sayfada görünür kalır.
 *
 * Yeni özellikler eklenirken bu dosyaya dokunmaya gerek yoktur.
 * Sadece config/ dizini veya utils/ güncellenir.
 */
import React from 'react';
import MiniIsland from './components/MiniIsland';
import ExpandedPanel from './components/ExpandedPanel';
import UploadManagerDevTools from './components/UploadManagerDevTools';
import { useBeforeUnload } from '@/shared/services/s3upload/useBeforeUnload';

const UploadManager: React.FC = () => {
  // Sayfa kapatılırken/yenilenirken aktif yüklemeler varsa kullanıcıyı uyar
  useBeforeUnload(true);

  return (
    <>
      <MiniIsland />
      <ExpandedPanel />
      <UploadManagerDevTools />
    </>
  );
};

export default UploadManager;
