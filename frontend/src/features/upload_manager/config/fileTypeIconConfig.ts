import { FileImage, FileText, FileArchive, File, FileAudio, FileVideo, FileCode } from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * MIME type → Lucide ikon haritası.
 * Yeni bir dosya tipi eklendiğinde sadece bu map'e entry eklenir.
 * Component koduna dokunmaya gerek yok.
 */
const FILE_TYPE_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  'image/': FileImage,
  'text/': FileText,
  'application/pdf': FileText,
  'application/json': FileCode,
  'application/zip': FileArchive,
  'application/gzip': FileArchive,
  'application/x-tar': FileArchive,
  'application/x-7z-compressed': FileArchive,
  'application/x-rar-compressed': FileArchive,
  'audio/': FileAudio,
  'video/': FileVideo,
};

/**
 * Bir MIME type için uygun Lucide ikonunu döndürür.
 * Önce tam eşleşme arar, bulamazsa prefix eşleşmesi dener,
 * hiçbiri yoksa default File ikonunu döndürür.
 */
export function getFileTypeIcon(mimeType: string): ComponentType<{ className?: string }> {
  // Tam eşleşme ara (örn: 'application/json')
  if (FILE_TYPE_ICON_MAP[mimeType]) return FILE_TYPE_ICON_MAP[mimeType];
  // Prefix eşleşmesi ara (örn: 'image/png' → 'image/')
  const prefix = mimeType.split('/')[0] + '/';
  if (FILE_TYPE_ICON_MAP[prefix]) return FILE_TYPE_ICON_MAP[prefix];
  // Hiçbiri yoksa varsayılan dosya ikonu
  return File;
}
