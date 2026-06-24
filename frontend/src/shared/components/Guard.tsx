import type { ReactNode } from 'react';
import { usePermission } from '@/context/PermissionContext';
import { type Permission } from '@/shared/roles';

interface GuardProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * 🔐 Guard Bileşeni
 *
 * Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol eder.
 * RoleProvider içinde kullanılmalıdır.
 *
 * KULLANIM:
 *   <Guard permission="project:update">
 *     <button>Güncelle</button>
 *   </Guard>
 *
 *   <Guard permission="member:add" fallback={<p>Yetkiniz yok</p>}>
 *     <button>Üye Ekle</button>
 *   </Guard>
 */
export const Guard = ({ permission, fallback = null, children }: GuardProps) => {
  const { hasPermission } = usePermission();

  if (hasPermission(permission)) return <>{children}</>;
  return <>{fallback}</>;
};
