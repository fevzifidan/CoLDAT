// ============================================================
// 1. ROL TANIMLARI
// ============================================================
export type BackendRole = 'admin' | 'member' | 'annotator' | 'viewer';
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
  | 'task:annotate'
  // --- Task Onay Yetkileri ---
  | 'task:submit-approval'
  | 'task:approve-reject'
  // --- Dataset Task Yetkileri ---
  | 'task:add-asset'
  | 'task:remove-asset'
  // --- Dataset Version Yetkileri ---
  | 'version:revert'
  | 'version:restore';

// ============================================================
// 3. PROJE SEVİYESİ PERMISSION MAP
// Proje detay sayfasında kullanılır.
// Rol: 'admin' veya 'member'
// ============================================================
export const PROJECT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    admin: [
    'project:create', 'project:update', 'project:delete', 'project:view',
    'dataset:create', 'dataset:update', 'dataset:delete', 'dataset:view',
    'member:add', 'member:remove', 'member:update-role', 'member:view',
    'asset:add', 'asset:remove', 'asset:view',
    'task:create', 'task:view-all', 'task:delete', 'task:reassign',
    'task:annotate', 'task:submit-approval', 'task:approve-reject',
    'task:add-asset', 'task:remove-asset',
  ],
  member: [
    'project:view',
    'dataset:view',
    'member:view',
    'asset:view',
    'task:view-assigned',
  ],
};

// ============================================================
// 4. DATASET SEVİYESİ PERMISSION MAP
// Dataset detay sayfası ve dataset kartlarında kullanılır.
// Rol: 'admin', 'annotator', veya 'viewer'
// ============================================================
export const DATASET_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    admin: [
    'dataset:update', 'dataset:delete', 'dataset:view',
    'member:add', 'member:remove', 'member:update-role', 'member:view',
    'asset:add', 'asset:remove', 'asset:view',
    'task:create', 'task:view-all', 'task:delete', 'task:reassign',
    'task:annotate', 'task:submit-approval', 'task:approve-reject',
    'task:add-asset', 'task:remove-asset', 'task:view-assigned',
    'version:revert', 'version:restore'
  ],
  annotator: [
    'dataset:view',
    'member:view',
    'asset:view',
    'task:view-assigned',
    'task:annotate',
    'task:submit-approval',
    'task:view-assigned',
  ],
  viewer: [
    'dataset:view',
    'member:view',
    'asset:view',
    'task:view-assigned',
  ],
};

// ============================================================
// 5. GERİYE DÖNÜK UYUMLULUK (BACKWARD COMPATIBILITY)
// Eski kodların ROLE_PERMISSIONS kullanımı bozulmasın diye
// varsayılan olarak PROJECT_ROLE_PERMISSIONS'ı export et
// ============================================================
export const ROLE_PERMISSIONS = PROJECT_ROLE_PERMISSIONS;

