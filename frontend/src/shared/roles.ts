// ============================================================
// 1. ROL TANIMLARI
// ============================================================
export type BackendRole = 'admin' | 'annotator' | 'viewer';
export type ProjectRole = BackendRole;
export type DatasetRole = BackendRole;

// ============================================================
// 2. YETKİ (PERMISSION) TANIMLARI
// ============================================================
export type Permission =
  // --- Proje Yetkileri ---
  | 'project:create'
  | 'project:update'
  | 'project:delete'
  | 'project:view'
  // --- Dataset Yetkileri ---
  | 'dataset:create'
  | 'dataset:update'
  | 'dataset:delete'
  | 'dataset:view'
  // --- Üye Yetkileri ---
  | 'member:add'
  | 'member:remove'
  | 'member:update-role'
  | 'member:view'
  // --- Asset Yetkileri ---
  | 'asset:add'
  | 'asset:remove'
  | 'asset:view'
  // --- Task Yetkileri ---
  | 'task:create'
  | 'task:view-all'
  | 'task:view-assigned'
  | 'task:delete'
  | 'task:reassign'
  // --- Task Onay Yetkileri ---
  | 'task:submit-approval'
  | 'task:approve-reject'
  // --- Dataset Task Yetkileri ---
  | 'task:add-asset'
  | 'task:remove-asset';

// ============================================================
// 3. ROL → YETKİ EŞLEMESİ
// ============================================================
export const ROLE_PERMISSIONS: Record<BackendRole, Permission[]> = {
  admin: [
    'project:create', 'project:update', 'project:delete', 'project:view',
    'dataset:create', 'dataset:update', 'dataset:delete', 'dataset:view',
    'member:add', 'member:remove', 'member:update-role', 'member:view',
    'asset:add', 'asset:remove', 'asset:view',
    'task:create', 'task:view-all', 'task:delete', 'task:reassign',
    'task:submit-approval', 'task:approve-reject',
    'task:add-asset', 'task:remove-asset',
  ],
  annotator: [
    'project:view',
    'dataset:view',
    'member:view',
    'asset:view',
    'task:view-assigned',
    'task:submit-approval',
  ],
  viewer: [
    'project:view',
    'dataset:view',
    'member:view',
    'asset:view',
    'task:view-assigned',
  ],
};
