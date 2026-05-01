export type UploadPriority = 'HIGH' | 'LOW';
export type UploadStatus = 'IDLE' | 'PREPROCESSING' | 'HASHING' | 'REQUESTING_URL' | 'UPLOADING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export type UploadType = 'asset' | 'embedding';

export interface UploadTask {
    upload_id: string; // Client tarafında üretilen UUID
    upload_type: UploadType; // Yüklenecek dosyanın tipi
    hidden?: boolean; // UI yükleme yöneticisinden gizli yürütülüp yürütülmeyeceği
    asset_id?: string; // Backend'den url isteği sonrası dönecek veya embedding için baştan verilecek
    dataset_id: string;
    file: File;
    priority: UploadPriority;
    status: UploadStatus;
    progress: number;
    hash?: string;
    width?: number;
    height?: number;
    upload_url?: string;
    expiry_at?: string;
    abortController?: AbortController;
    xhr?: XMLHttpRequest;
}