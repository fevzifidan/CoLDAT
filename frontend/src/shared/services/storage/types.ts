// User

export interface IUser {
    id: number // Auto Increment (Local ID)
    first_name: string,
    last_name: string,
    username: string,
    theme_preference: "light" | "dark" | "system"
}

// Images (Used for both dataset view and task view)

export interface IImages {
    dataset_id?: string,
    asset_id: string,
    filename: string,
    mime_type: string,
    blob?: Blob | File,
    asset_url: string,
    asset_url_expiry_at: number,
    sam_embedding_url?: string,
    sam_embedding_url_expiry_at?: number
    status: string,
}

// Asset Uploads

export interface IAssetUploads {
    upload_id: string, // string (UUIDv7) -- Created locally
    filename: string,
    mime_type: string,
    hash_sha256?: string,
    width: number,
    height: number,
    fileBlob: Blob | File,
    asset_id?: string, // string (UUIDv7) -- Comes from backend  
    upload_url?: string,
    expiry_at?: number,
    status: 'pending' | 'processing' | 'uploading' | 'completed' | 'failed';
    error_message?: string
}

// ---- Interfaces for Pagination-Compatible Storage Infrastructure ----

export interface IContextMetadata {
    contextId: string; // PK
    nextCursor: string | null;
    totalItems: number; // Number of records saved
    lastSync: number;
}

export interface IPaginatedItem {
    id: string; // UUIDv7 coming from backend response
    contextId: string; // The context to which it belongs
    index: number;
    dataId: string; // FK
    itemType: 'user' | 'image' | 'upload';
    createdAt: number; // Timestamp for cache invalidation
}

// Confirmation Modal User Preference

export interface UserConfirmationPreferences {
  id: string;      // Context ID of the Confirmation Dialog
  skipped: boolean; // Indicates whether the dialog will be shown again later
}