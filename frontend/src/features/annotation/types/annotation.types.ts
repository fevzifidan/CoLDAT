// ─── Annotation Core Types ──────────────────────────────────────────────────

export type AnnotationStatus = 'UPLOADED' | 'PENDING' | 'VERIFICATION_FAILED' | 'FAILED';

export type EmbeddingStatus = AnnotationStatus;

export type AnnotationTool = 'select' | 'bbox' | 'polygon' | 'pan';

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
  count: number;
}

export interface RelationType {
  id: string;
  name: string;     // e.g. "DRIVES", "STOPS AT"
  directed: boolean;
}

export interface AnnotatedObject {
  id: string;       // e.g. "a8f2a"
  label: string;    // e.g. "Car_01"
  classId: string;
  color: string;
  bbox: BoundingBox;
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
