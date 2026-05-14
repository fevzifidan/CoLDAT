// ─── Annotation Core Types ──────────────────────────────────────────────────

export type AnnotationStatus = 'UPLOADED' | 'PENDING' | 'VERIFICATION_FAILED' | 'FAILED';

export type EmbeddingStatus = AnnotationStatus;

export type AnnotationTool = 'select' | 'bbox' | 'polygon' | 'points' | 'pan' | 'pen' | 'eraser' | 'livewire' | 'sam';

export interface BoundingBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface ClassDef {
  id: string;
  name: string;
  color: string;   // hex or tailwind-compatible color
  index: number;
  isActive: boolean;
  includeInExport: boolean;
  count?: number;
}

export interface RelationType {
  id: string;
  name: string;     // e.g. "DRIVES", "STOPS AT"
  isActive: boolean;
  includeInExport: boolean;
  directed?: boolean;
}

// ─── UI-Internal Annotation State Types ─────────────────────────────────────

export interface AnnotatedObject {
  id: string;       // UUID
  label: string;    // e.g. "Car_01"
  classId: string;
  type: 'bbox' | 'polygon' | 'keypoint';
  coordinates: number[]; // [x,y,w,h] for bbox, [x1,y1,x2,y2...] for polygon
  color: string;
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

export interface ObjectRelation {
  id: string;
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
  relationTypeId: string;
  relationTypeName: string;
}

// ─── API Response Types (matches backend OpenAPI schema) ─────────────────────

/**
 * Image object as returned by GET /tasks/{taskId}/images
 */
export interface TaskImage {
  asset_id: string;
  filename: string;
  mime_type: string;
  /** Presigned S3 URL (time-limited) */
  asset_url: string;
  asset_url_expiry_at: string;
  /** URL to precomputed MobileSAM embedding file. Null if not uploaded. */
  sam_embedding_url: string | null;
  sam_embedding_url_expiry_at: string | null;
  status: AnnotationStatus;
  embedding_status: EmbeddingStatus | null;
}

/**
 * Scene graph relationship as stored in the backend (Visual Genome style).
 * Used in API request/response bodies.
 */
export interface SceneGraphRelationship {
  subject_id: string;
  object_id: string;
  predicate: string;
}

/**
 * The full annotation payload for a single image.
 * Used for both GET and PUT /images/{imageId}/annotations.
 */
export interface AnnotationData {
  objects: Array<{
    id: string;
    class_id: string;
    type: 'bbox' | 'polygon' | 'keypoint';
    /** [x, y, w, h] for bbox or [x1, y1, x2, y2, ...] for polygon */
    coordinates: number[];
  }>;
  relationships: SceneGraphRelationship[];
}

/**
 * Paginated response from GET /tasks/{taskId}/images
 */
export interface TaskImagesResponse {
  data: TaskImage[];
  next_cursor: string | null;
}

export type TaskStatus = 'open' | 'in_progress' | 'approval_pending' | 'completed' | 'rejected';
export type UserRole = 'Annotator' | 'Viewer';

export interface Task {
  id: string;
  dataset_id: string;
  assignee_id: string;
  role: UserRole;
  status: TaskStatus;
  rejection_note: string | null;
  image_count: number;
}

export interface TaxonomyResponse {
  classes: Array<{
    id: string;
    name: string;
    color: string;
    /** YOLO/COCO export'ta sınıf indeksini belirler; spec'teki ClassItem.index alanı. */
    index: number;
    /** false ise sınıf pasiftir ve annotation UI'da gösterilmez. */
    isActive: boolean;
    /** false ise bu sınıfa ait annotation'lar export'a dahil edilmez. */
    includeInExport: boolean;
  }>;
  predicates: Array<{
    id: string;
    name: string;
    isActive: boolean;
    includeInExport: boolean;
  }>;
  /** Gelecekte nişaan (attribute) tabanlı filtreleme için rezerve edilmiştir. */
  attributes: Array<{
    id: string;
    name: string;
    isActive: boolean;
    includeInExport: boolean;
  }>;
}

export interface DatasetDetails {
  id: string;
  project_id: string;
  name: string;
  description: string;
  current_version: string;
  total_images: number;
  annotated_images: number;
  role: 'admin' | 'annotator' | 'viewer';
}

// ─── SAM-specific Types ─────────────────────────────────────────────────────

/**
 * Embedding availability lifecycle status.
 * Tracks the end-to-end flow from cache check → backend check → download/compute.
 */
export type SAMStatus =
  | 'idle'
  | 'checking_cache'
  | 'checking_backend'
  | 'downloading_embedding'
  | 'computing_local'
  | 'ready';

/**
 * A single point prompt for the MobileSAM decoder.
 * Stored in **original image pixel coordinates** (not model tensor space).
 * Conversion to 1024×1024 padded space happens just before sending to the worker.
 */
export interface SAMPrompt {
  x: number;
  y: number;
  type: 'positive' | 'negative';
}

/**
 * State shape for the SAM slice.
 * Separate from the slice definition to allow type-only imports.
 */
export interface SamState {
  samStatus: SAMStatus;
  samDownloadProgress: number;
  samEmbeddingReady: boolean;
  samPrompts: SAMPrompt[];
  samMaskBlobUrl: string | null;
  samPromptCount: number;
  samMaskData: { maskData: Uint8Array; width: number; height: number } | null;

  setSamStatus: (status: SAMStatus) => void;
  setSamDownloadProgress: (progress: number) => void;
  setSamEmbeddingReady: (ready: boolean) => void;
  addSamPrompt: (x: number, y: number, type: 'positive' | 'negative') => void;
  removeSamPrompt: (index: number) => void;
  clearSamPrompts: () => void;
  setSamMaskBlobUrl: (url: string | null) => void;
  clearSamMask: () => void;
  resetSamState: () => void;
  clearSamSession: () => void;
  setSamMaskData: (data: { maskData: Uint8Array; width: number; height: number } | null) => void;
}

