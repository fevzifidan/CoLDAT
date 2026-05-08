/**
 * annotation.api.mock.ts
 *
 * Test modu için mock API servisi.
 * annotation.api.ts ile aynı fonksiyon imzalarına sahiptir.
 * VITE_TEST_MODE=true olduğunda bu servis kullanılır.
 *
 * Hiçbir backend veya S3 bağımlılığı yoktur.
 */
import notificationService from '@/shared/services/notification';
import type {
  AnnotationData,
  TaskImage,
  TaskImagesResponse,
  Task,
  TaxonomyResponse,
  DatasetDetails,
} from '../types/annotation.types';

// Mock veri — useAnnotationData.ts'deki MOCK_QUEUE ile senkronize
const MOCK_IMAGES: TaskImagesResponse['data'] = [
  {
    asset_id: 'img-1',
    filename: 'IMG_4821.jpg',
    asset_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=80&h=80&fit=crop',
    asset_url_expiry_at: new Date(Date.now() + 3600_000).toISOString(),
    sam_embedding_url: null,
    sam_embedding_url_expiry_at: null,
    mime_type: 'image/jpeg',
    status: 'PENDING',
    embedding_status: null,
  },
  {
    asset_id: 'img-2',
    filename: 'IMG_4822.jpg',
    asset_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=80&h=80&fit=crop',
    asset_url_expiry_at: new Date(Date.now() + 3600_000).toISOString(),
    sam_embedding_url: null,
    sam_embedding_url_expiry_at: null,
    mime_type: 'image/jpeg',
    status: 'PENDING',
    embedding_status: null,
  },
  {
    asset_id: 'img-3',
    filename: 'IMG_4820.jpg',
    asset_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=80&h=80&fit=crop',
    asset_url_expiry_at: new Date(Date.now() + 3600_000).toISOString(),
    sam_embedding_url: null,
    sam_embedding_url_expiry_at: null,
    mime_type: 'image/jpeg',
    status: 'PENDING',
    embedding_status: null,
  },
  {
    asset_id: 'img-4',
    filename: 'IMG_4819.jpg',
    asset_url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?w=80&h=80&fit=crop',
    asset_url_expiry_at: new Date(Date.now() + 3600_000).toISOString(),
    sam_embedding_url: null,
    sam_embedding_url_expiry_at: null,
    mime_type: 'image/jpeg',
    status: 'PENDING',
    embedding_status: null,
  },
  {
    asset_id: 'img-5',
    filename: 'IMG_4818.jpg',
    asset_url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=80&h=80&fit=crop',
    asset_url_expiry_at: new Date(Date.now() + 3600_000).toISOString(),
    sam_embedding_url: null,
    sam_embedding_url_expiry_at: null,
    mime_type: 'image/jpeg',
    status: 'PENDING',
    embedding_status: null,
  },
  {
    asset_id: 'img-6',
    filename: 'IMG_4817.jpg',
    asset_url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=80&h=80&fit=crop',
    asset_url_expiry_at: new Date(Date.now() + 3600_000).toISOString(),
    sam_embedding_url: null,
    sam_embedding_url_expiry_at: null,
    mime_type: 'image/jpeg',
    status: 'PENDING',
    embedding_status: null,
  },
];

const MOCK_ANNOTATION_DATA: AnnotationData = {
  objects: [
    {
      id: 'obj-1',
      class_id: 'cls-car',
      type: 'bbox',
      coordinates: [452, 320, 160, 120],
    },
    {
      id: 'obj-2',
      class_id: 'cls-ped',
      type: 'bbox',
      coordinates: [210, 180, 80, 130],
    },
  ],
  relationships: [
    {
      subject_id: 'obj-2',
      object_id: 'obj-1',
      predicate: 'DRIVES',
    },
  ],
};

/** Ağ gecikmesini taklit etmek için kısa bir gecikme */
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── Mock API fonksiyonları ───────────────────────────────────────────────────

export async function getTaskImages(
  _taskId: string,
  _limit: number = 50,
  _cursor: string | null = null
): Promise<TaskImagesResponse> {
  await delay();
  return { data: MOCK_IMAGES, next_cursor: null };
}

export async function getAnnotations(_imageId: string): Promise<AnnotationData> {
  await delay();
  return MOCK_ANNOTATION_DATA;
}

export async function saveAnnotations(
  _imageId: string,
  _data: AnnotationData,
  silent: boolean = false
): Promise<void> {
  await delay(150);
  if (!silent) {
    notificationService.success('Annotations saved successfully. (test mode)');
  }
}

export async function clearAnnotations(_imageId: string): Promise<void> {
  await delay(150);
  // No-op in test mode
}

export async function deleteImage(_imageId: string): Promise<void> {
  await delay(150);
  // No-op in test mode
}

export async function getTaskDetails(taskId: string): Promise<Task> {
  await delay();
  return {
    id: taskId,
    dataset_id: 'mock-dataset-id',
    assignee_id: 'mock-user-id',
    role: 'Annotator',
    status: 'in_progress',
    rejection_note: null,
    image_count: 8,
  };
}

export async function getProjectTaxonomy(_projectId: string): Promise<TaxonomyResponse> {
  await delay();
  return {
    classes: [
      { id: 'cls-car', name: 'Car', color: '#3b82f6', index: 0, isActive: true, includeInExport: true },
      { id: 'cls-ped', name: 'Pedestrian', color: '#ef4444', index: 1, isActive: true, includeInExport: true },
      { id: 'cls-light', name: 'Traffic Light', color: '#f59e0b', index: 2, isActive: true, includeInExport: true },
    ],
    predicates: [
      { id: 'rel-drives', name: 'DRIVES', isActive: true, includeInExport: true },
      { id: 'rel-stops', name: 'STOPS AT', isActive: true, includeInExport: true },
    ],
    attributes: [],
  };
}

export async function updateTaskStatus(
  _taskId: string,
  _status: string,
  _note?: string
): Promise<void> {
  await delay(150);
  notificationService.success(`Task status updated to ${_status}. (test mode)`);
}

export async function getDatasetDetails(datasetId: string): Promise<DatasetDetails> {
  await delay();
  return {
    id: datasetId,
    project_id: 'mock-project-id',
    name: 'Mock Dataset',
    description: 'Description',
    current_version: 'v1.0',
    total_images: 100,
    annotated_images: 10,
    role: 'viewer',
  };
}
