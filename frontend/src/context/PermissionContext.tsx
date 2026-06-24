import { createContext, useContext, type ReactNode } from 'react';
import { type Permission, type BackendRole, PROJECT_ROLE_PERMISSIONS } from '@/shared/roles';

interface PermissionContextValue {
  role: BackendRole | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  isAnnotator: boolean;
  isViewer: boolean;
  isMember: boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * 🔐 RoleProvider
 *
 * SADECE belirli bir context (sayfa/kart) içinde kullanılır.
 * ASLA global seviyede kullanılmaz!
 *
 * KULLANIM:
 *   {/* Proje detay sayfası: proje permission map'i ile * /}
 *   <RoleProvider role={project.role} permissionMap={PROJECT_ROLE_PERMISSIONS}>
 *     <GeneralSettings />
 *   </RoleProvider>
 *
 *   {/* Dataset detay sayfası: dataset permission map'i ile * /}
 *   <RoleProvider role={dataset.role} permissionMap={DATASET_ROLE_PERMISSIONS}>
 *     <DatasetDetail />
 *   </RoleProvider>
 *
 *   {/* Listelerde her kart kendi Provider'ını alır * /}
 *   {datasets.map(d => (
 *     <RoleProvider key={d.id} role={d.role} permissionMap={DATASET_ROLE_PERMISSIONS}>
 *       <DatasetCard dataset={d} />
 *     </RoleProvider>
 *   ))}
 */
export const RoleProvider = ({
  role,
  permissionMap,
  children,
}: {
  role: BackendRole | null;
  permissionMap?: Record<string, Permission[]>;
  children: ReactNode;
}) => {
  const map = permissionMap || PROJECT_ROLE_PERMISSIONS;
  const permissions = role ? (map[role] || []) : [];

  const value: PermissionContextValue = {
    role,
    permissions,
    hasPermission: (permission: Permission) => permissions.includes(permission),
    isAdmin: role === 'admin',
    isAnnotator: role === 'annotator',
    isViewer: role === 'viewer',
    isMember: role === 'member',
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * 🔐 usePermission
 *
 * Mevcut context'in rol ve yetki bilgilerine erişmek için kullanılır.
 * Bir RoleProvider içinde kullanılmalıdır, aksi halde hata fırlatır.
 */
export const usePermission = (): PermissionContextValue => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      'usePermission must be used within a RoleProvider. ' +
      'Wrap the component tree with <RoleProvider role={...}> first.'
    );
  }
  return context;
};
