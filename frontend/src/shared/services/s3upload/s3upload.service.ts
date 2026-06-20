import type { UploadTask, UploadPriority, UploadStatus, UploadType } from './types';
import apiService from '@/shared/services/api';
import { saveTasks, loadPersistedTasks, clearPersistedTasks, type PersistedTask } from './uploadPersistence';

// Debounce timer for persistence saves
let persistenceTimer: ReturnType<typeof setTimeout> | null = null;
const PERSISTENCE_DEBOUNCE_MS = 500;

// React state'i için listener tipi
type Listener = (tasks: Map<string, UploadTask>) => void;

class UploadService {
    private queue: UploadTask[] = [];
    private activeUploads: Map<string, UploadTask> = new Map();
    private maxConcurrent = 3;
    private listeners: Set<Listener> = new Set();

    // Batch Status Update İçin Gereklilikler
    private statusUpdateBuffer: { asset_id: string; upload_type: UploadType; success: boolean }[] = [];
    private statusUpdateTimer: ReturnType<typeof setTimeout> | null = null;
    private useMock = false;

    /** Persistence hazır mı? (ilk yükleme tamamlandı mı?) */
    private persistenceReady = false;

    private static instance: UploadService;
    public static getInstance(): UploadService {
        if (!UploadService.instance) UploadService.instance = new UploadService();
        return UploadService.instance;
    }

    /**
     * Sayfa yüklendiğinde çağrılır. Kalıcı depodaki task'leri yükler,
     * aktif durumdakileri FAILED olarak işaretler (File kaybolduğu için).
     */
    public async initialize(): Promise<void> {
        if (this.persistenceReady) return;

        const persistedTasks = await loadPersistedTasks();
        let hasChanges = false;

        persistedTasks.forEach((persisted) => {
            const isActive = !['SUCCESS', 'FAILED', 'CANCELLED'].includes(persisted.status);

            // Aktif task'ler sayfa yenilenince File kaybeder → FAILED
            const status = isActive ? 'FAILED' : persisted.status;

            // Runtime-only alanlar olmadan task oluştur
            const task: UploadTask = {
                upload_id: persisted.upload_id,
                upload_type: persisted.upload_type,
                hidden: persisted.hidden,
                asset_id: persisted.asset_id,
                dataset_id: persisted.dataset_id,
                priority: persisted.priority,
                status: status as UploadStatus,
                progress: isActive ? 0 : persisted.progress,
                isRetry: persisted.isRetry,
                hash: persisted.hash,
                width: persisted.width,
                height: persisted.height,
                upload_url: persisted.upload_url,
                expiry_at: persisted.expiry_at,
                // File kayboldu — dummy File nesnesi (sadece metadata için)
                file: new File([], persisted.fileName, { type: persisted.fileType }),
                abortController: undefined,
                xhr: undefined,
            };

            this.activeUploads.set(task.upload_id, task);

            if (isActive) {
                hasChanges = true;
            }
        });

        if (hasChanges) {
            // Değişiklikleri kalıcı depoya yaz
            await saveTasks(this.activeUploads);
        }

        this.persistenceReady = true;
        this.notify();
    }

    public setMockMode(enabled: boolean) {
        this.useMock = enabled;
    }

    public subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Tüm task'leri (gizli olanlar dahil) döndürür.
     * useUploads hook'u tarafından full state için kullanılır.
     */
    public getAllTasks(): UploadTask[] {
        return Array.from(this.activeUploads.values());
    }

    private notify() {
        const visibleTasks = new Map<string, UploadTask>();
        this.activeUploads.forEach((task, id) => {
            if (!task.hidden) {
                visibleTasks.set(id, task);
            }
        });
        this.listeners.forEach(listener => listener(visibleTasks));

        // Her notify'da persistence'ı debounce ile güncelle
        this.schedulePersistenceSave();
    }

    /**
     * Her state değişiminde persistence'ı hemen değil,
     * debounce ile (500ms) kaydeder — aşırı yazmayı önler.
     */
    private schedulePersistenceSave() {
        if (persistenceTimer) clearTimeout(persistenceTimer);
        persistenceTimer = setTimeout(() => {
            saveTasks(this.activeUploads);
        }, PERSISTENCE_DEBOUNCE_MS);
    }

    // Yeni dosya ekleme (datasetId ile)
    public async addUpload(file: File, dataset_id: string, params?: { priority?: UploadPriority; upload_type?: UploadType; asset_id?: string; hidden?: boolean }) {
        const priority = params?.priority || 'LOW';
        const upload_type = params?.upload_type || 'asset';
        const hidden = params?.hidden ?? false;
        const asset_id = params?.asset_id;

        const upload_id = crypto.randomUUID(); // Client-side UUID

        const task: UploadTask = {
            upload_id,
            upload_type,
            hidden,
            asset_id,
            dataset_id,
            file,
            priority,
            status: 'IDLE',
            progress: 0,
            abortController: new AbortController(),
        };

        this.activeUploads.set(upload_id, task);

        if (priority === 'HIGH') this.queue.unshift(task);
        else this.queue.push(task);

        this.notify();
        this.processQueue();
    }

    private async processQueue() {
        const currentActive = Array.from(this.activeUploads.values()).filter(
            t => ['PREPROCESSING', 'HASHING', 'REQUESTING_URL', 'UPLOADING'].includes(t.status)
        ).length;

        if (currentActive >= this.maxConcurrent || this.queue.length === 0) return;

        const task = this.queue.shift();
        if (task) {
            this.executeTask(task);
            this.processQueue();
        }
    }

    private async executeTask(task: UploadTask) {
        try {
            // Task sadece baştan başlıyorsa hash hesaplasın, retry ise halihazırda var.
            if (!task.hash) {
                // 1. Resim boyutlarını çıkar (Eğer asset ise)
                this.updateTaskStatus(task.upload_id, 'PREPROCESSING');
                if (task.upload_type === 'asset' && task.file.type.startsWith('image/')) {
                    const dims = await this.getImageDimensions(task.file);
                    task.width = dims.width;
                    task.height = dims.height;
                }

                // 2. Worker ile SHA-256 hesapla
                this.updateTaskStatus(task.upload_id, 'HASHING');
                task.hash = await this.calculateHashWorker(task.file);
            }

            this.updateTaskStatus(task.upload_id, 'REQUESTING_URL');

            // Sadece isRetry=true olan (FAILED → retryUpload çağrılmış) task'lar Retry-Upload API'sine gider.
            // İlk yükleme (asset veya embedding fark etmez) her zaman Presigned URL alır.
            if (task.isRetry && task.asset_id) {
                await this.fetchRetryUrl(task);
            } else {
                await this.fetchPresignedUrl(task);
            }

            // 4. URL Expiry Kontrolü (Kuyrukta çok beklemişse yenile)
            await this.ensureUrlValid(task);

            // 5. S3'e doğrudan yükle
            this.updateTaskStatus(task.upload_id, 'UPLOADING');
            await this.uploadToS3(task);

            // 6. Başarılı durumu buffer'a ekle
            this.updateTaskStatus(task.upload_id, 'SUCCESS', 100);
            this.bufferStatusUpdate(task.asset_id!, task.upload_type, true);

        } catch (error) {
            if ((error as any).name === 'AbortError') return;
            this.updateTaskStatus(task.upload_id, 'FAILED');
            if (task.asset_id) {
                this.bufferStatusUpdate(task.asset_id, task.upload_type, false);
            }
        } finally {
            this.processQueue();
        }
    }

    // --- API Endpoint Entegrasyonları ---

    private async fetchPresignedUrl(task: UploadTask) {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simule gecikme
            task.asset_id = crypto.randomUUID();
            task.upload_url = `https://mock-s3.amazonaws.com/uploads/${task.upload_id}`;
            task.expiry_at = new Date(Date.now() + 3600000).toISOString();
            return;
        }

        const responseData = await apiService.post(`/assets/upload-urls/${task.dataset_id}`, {
            files: [{
                upload_id: task.upload_id,
                upload_type: task.upload_type,
                asset_id: task.upload_type === 'embedding' ? task.asset_id : undefined,
                filename: task.file.name,
                mime_type: task.file.type || 'application/octet-stream',
                file_sha256: task.hash,
                width: task.upload_type === 'asset' ? task.width : undefined,
                height: task.upload_type === 'asset' ? task.height : undefined
            }]
        }, { signal: task.abortController?.signal });

        const urlData = responseData.urls.find((u: { upload_id: string }) => u.upload_id === task.upload_id);
        if (!urlData) throw new Error('Upload ID mismatch from backend');

        task.asset_id = urlData.asset_id;
        task.upload_url = urlData.upload_url;
        task.expiry_at = urlData.expiry_at;
    }

    private async fetchRetryUrl(task: UploadTask) {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 800));
            task.upload_url = `https://mock-s3.amazonaws.com/uploads/${task.upload_id}/retry`;
            task.expiry_at = new Date(Date.now() + 3600000).toISOString();
            return;
        }

        const data = await apiService.post(`/assets/${task.asset_id}/retry-upload`, {
            upload_id: task.upload_id,
            upload_type: task.upload_type,
            asset_id: task.upload_type === 'embedding' ? task.asset_id : undefined,
            filename: task.file.name,
            mime_type: task.file.type || 'application/octet-stream',
            file_sha256: task.hash,
            width: task.upload_type === 'asset' ? task.width : undefined,
            height: task.upload_type === 'asset' ? task.height : undefined
        });

        task.upload_url = data.url.upload_url;
        task.expiry_at = data.url.expiry_at;
    }

    // API Tasarımı ile Tam Uyumlu Retry ( /assets/{asset_id}/retry-upload )
    public async retryUpload(upload_id: string) {
        const task = this.activeUploads.get(upload_id);
        if (!task || task.status !== 'FAILED' || !task.asset_id) return;

        task.isRetry = true;  // executeTask'in fetchRetryUrl'e yönlenmesi için
        task.status = 'IDLE';
        task.progress = 0;
        task.abortController = new AbortController();
        this.notify();

        this.queue.unshift(task);
        this.processQueue();
    }

    // Expiration Süresi Kontrolü ve Refresh
    private async ensureUrlValid(task: UploadTask) {
        if (!task.expiry_at || !task.asset_id) return;

        const expiryTime = new Date(task.expiry_at).getTime();
        const now = Date.now();

        // Eğer sürenin bitmesine 1 dakikadan az kalmışsa url'i yenile
        if (expiryTime - now < 60000) {
            const data = await apiService.post(`/assets/bulk-refresh-urls`, { asset_ids: [task.asset_id] });
            const refUrl = data.refreshed_assets.find((u: { asset_id: string }) => u.asset_id === task.asset_id);
            if (refUrl) {
                task.upload_url = refUrl.upload_url;
                task.expiry_at = refUrl.expiry_at;
            }
        }
    }

    // --- Bulk (Toplu) Status Update Buffer Mekanizması ---
    // API description: "ağ trafiği oluşturmamak için topluca yapılır."
    private bufferStatusUpdate(asset_id: string, upload_type: UploadType, success: boolean) {
        this.statusUpdateBuffer.push({ asset_id, upload_type, success });

        if (this.useMock) {
        }

        if (!this.statusUpdateTimer) {
            this.statusUpdateTimer = setTimeout(() => this.flushStatusUpdates(), 3000); // 3 sn bekle toplu at
        }
    }

    private async flushStatusUpdates() {
        if (this.statusUpdateBuffer.length === 0) return;

        const updates = [...this.statusUpdateBuffer];
        this.statusUpdateBuffer = [];
        this.statusUpdateTimer = null;

        if (this.useMock) {
            return;
        }

        try {
            await apiService.post('/assets/bulk-update-status', { updates }, { silent: true });
        } catch (error) {
            console.error('Failed to flush status updates. Cron job will handle the reconciliation.', error);
        }
    }

    // --- S3'e Yükleme (Önceki İle Benzer) ---
    private uploadToS3(task: UploadTask): Promise<void> {
        function hexToBase64(hex: string): string {
            const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
            const binary = String.fromCharCode(...bytes);
            return btoa(binary);
        }
        if (this.useMock) {
            return new Promise((resolve, reject) => {
                let progress = 0;
                const interval = setInterval(() => {
                    if (task.abortController?.signal.aborted) {
                        clearInterval(interval);
                        reject(new DOMException('Aborted', 'AbortError'));
                        return;
                    }

                    progress += Math.floor(Math.random() * 15) + 5;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        this.updateTaskStatus(task.upload_id, 'UPLOADING', 100);
                        resolve();
                    } else {
                        this.updateTaskStatus(task.upload_id, 'UPLOADING', progress);
                    }
                }, 300);
            });
        }

        return new Promise((resolve, reject) => {
            if (!task.upload_url || !task.hash) return reject(new Error('Missing Upload URL or Hash'));

            const xhr = new XMLHttpRequest();
            task.xhr = xhr;

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    this.updateTaskStatus(task.upload_id, 'UPLOADING', progress);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`S3 Error: ${xhr.status}`));
            };

            xhr.onerror = () => reject(new Error('Network Error'));
            xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

            xhr.open('PUT', task.upload_url);
            xhr.setRequestHeader('x-amz-checksum-sha256', hexToBase64(task.hash));
            xhr.setRequestHeader('Content-Type', task.file.type || 'application/octet-stream');
            xhr.send(task.file);
        });
    }

    // --- İptal Etme ---
    public cancelUpload(upload_id: string) {
        const task = this.activeUploads.get(upload_id);
        if (!task) return;

        if (task.status === 'UPLOADING' && task.xhr) task.xhr.abort();
        else if (task.abortController) task.abortController.abort();

        this.queue = this.queue.filter(t => t.upload_id !== upload_id);
        this.updateTaskStatus(upload_id, 'CANCELLED');
        this.processQueue();
    }

    /**
     * Terminal durumdaki (SUCCESS/FAILED/CANCELLED) bir task'i UI'dan kaldırır.
     * Task hidden=true yapılır, notify tetiklenir, UI'dan kaybolur.
     */
    public async dismissUpload(upload_id: string) {
        const task = this.activeUploads.get(upload_id);
        if (!task) return;
        if (!['SUCCESS', 'FAILED', 'CANCELLED'].includes(task.status)) return;
        task.hidden = true;
        // Kalıcı depodan da kaldır
        this.activeUploads.delete(upload_id);
        this.notify();
    }

    /**
 * Tüm terminal durumdaki task'leri UI'dan kaldırır ve kalıcı depoyu temizler.
 * Close/X butonu için — başarılı, hatalı ve iptal edilmiş dosyaları temizler.
 */
    public async dismissAllCompleted() {
        this.activeUploads.forEach((task, id) => {
            if (!task.hidden && ['SUCCESS', 'FAILED', 'CANCELLED'].includes(task.status)) {
                this.activeUploads.delete(id);
            }
        });
        // Tüm kalıcı depoyu temizle (görünür terminal task kalmadı)
        await clearPersistedTasks();
        this.notify();
    }

    /**
     * Tüm aktif (terminal olmayan) task'leri iptal eder.
     * "Pause All" butonu için — tüm kuyruğu ve aktif yüklemeleri durdurur.
     */
    public cancelAll() {
        // Önce kuyruğu temizle (yeni task başlamasın)
        this.queue = [];
        // Tüm aktif task'leri iptal et
        this.activeUploads.forEach((task, upload_id) => {
            if (!['SUCCESS', 'FAILED', 'CANCELLED'].includes(task.status)) {
                if (task.status === 'UPLOADING' && task.xhr) task.xhr.abort();
                else if (task.abortController) task.abortController.abort();
                task.status = 'CANCELLED';
                task.progress = 0;
            }
        });
        this.notify();
    }

    // --- Yardımcı Fonksiyonlar ---
    private updateTaskStatus(upload_id: string, status: UploadStatus, progress?: number) {
        const task = this.activeUploads.get(upload_id);
        if (task) {
            task.status = status;
            if (progress !== undefined) task.progress = progress;
            this.notify();

            // Gizli task'ler terminal duruma (başarılı/hatalı/iptal) ulaştığında memory'den temizle
            if (task.hidden && ['SUCCESS', 'FAILED', 'CANCELLED'].includes(status)) {
                this.activeUploads.delete(upload_id);
            }
        }
    }

    private calculateHashWorker(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const worker = new Worker(new URL('./hash.worker.ts', import.meta.url));
            worker.postMessage({ file });
            worker.onmessage = (e) => {
                if (e.data.success) resolve(e.data.hash);
                else reject(e.data.error);
                worker.terminate();
            };
        });
    }

    private getImageDimensions(file: File): Promise<{ width: number, height: number }> {
        return new Promise((resolve) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(objectUrl);
            };
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = objectUrl;
        });
    }
}

export const uploadService = UploadService.getInstance();