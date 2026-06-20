import { createContext, useContext, ReactNode } from 'react';
import { type Permission, type BackendRole, ROLE_PERMISSIONS } from '@/shared/roles';

interface PermissionContextValue {
  role: BackendRole | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  isAnnotator: boolean;
  isViewer: boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * 🔐 RoleProvider
 *
 * SADECE belirli bir context (sayfa/kart) içinde kullanılır.
 * ASLA global seviyede kullanılmaz!
 *
 * KULLANIM:
 *   <RoleProvider role={project.user_role}>
 *     <GeneralSettings />
 *   </RoleProvider>
 *
 *   {/* Listelerde her kart kendi Provider'ını alır * /}
 *   {datasets.map(d => (
 *     <RoleProvider key={d.id} role={d.role}>
 *       <DatasetCard dataset={d} />
 *     </RoleProvider>
 *   ))}
 */
export const RoleProvider = ({
  role,
  children,
}: {
  role: BackendRole | null;
  children: ReactNode;
}) => {
  const permissions = role ? ROLE_PERMISSIONS[role] : [];

  const value: PermissionContextValue = {
    role,
    permissions,
    hasPermission: (permission: Permission) => permissions.includes(permission),
    isAdmin: role === 'admin',
    isAnnotator: role === 'annotator',
    isViewer: role === 'viewer',
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
