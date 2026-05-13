/**
 * useBeforeUnload — Sayfa kapatılırken/yenilenirken aktif yüklemeler varsa kullanıcıyı uyarır.
 *
 * Tarayıcının built-in beforeunload dialog'unu kullanır.
 * Sadece henüz tamamlanmamış (terminal olmayan) yüklemeler varsa aktifleşir.
 */
import { useEffect } from 'react';
import { uploadService } from './s3upload.service';

/**
 * @param enabled - Hook'un aktif olup olmadığı (opsiyonel, varsayılan: true)
 */
export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const tasks = uploadService.getAllTasks();
      const hasActive = tasks.some(
        (task) => !['SUCCESS', 'FAILED', 'CANCELLED'].includes(task.status)
      );

      if (hasActive) {
        // Modern tarayıcılar özelleştirilmiş mesaja izin vermez,
        // ancak event'in preventDefault'u çağrılmalıdır.
        event.preventDefault();
        // Chrome için (geriye dönük uyumluluk)
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);
}
