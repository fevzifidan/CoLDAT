// ─── Annotation Core Types ──────────────────────────────────────────────────

export type AnnotationStatus = 'UPLOADED' | 'PENDING' | 'VERIFICATION_FAILED' | 'FAILED';

export type EmbeddingStatus = AnnotationStatus;

export type AnnotationTool = 'select' | 'bbox' | 'polygon' | 'points' | 'pan' | 'pen' | 'eraser';

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
  count?: number;
}

export interface RelationType {
  id: string;
  name: string;     // e.g. "DRIVES", "STOPS AT"
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
  }>;
  predicates: Array<{
    id: string;
    name: string;
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

// ─── Legacy alias kept for backwards compatibility ───────────────────────────

/** @deprecated Use TaskImage instead */
export interface QueueImage {
  asset_id: string;
  filename: string;
  mime_type: string;
  asset_url: string;
  asset_url_expiry_at: string;
  sam_embedding_url: string;
  sam_embedding_url_expiry_at: string;
  status: AnnotationStatus;
  embedding_status: EmbeddingStatus;
}
