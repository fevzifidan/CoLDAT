import React from 'react';
import MiniIsland from './components/MiniIsland';
import ExpandedPanel from './components/ExpandedPanel';
import UploadManagerDevTools from './components/UploadManagerDevTools';

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
 * Yeni özellikler eklenirken bu dosyaya dokunmaya gerek yoktur.
 * Sadece config/ dizini veya utils/ güncellenir.
 */
const UploadManager: React.FC = () => {
  return (
    <>
      <MiniIsland />
      <ExpandedPanel />
      <UploadManagerDevTools />
    </>
  );
};

export default UploadManager;
