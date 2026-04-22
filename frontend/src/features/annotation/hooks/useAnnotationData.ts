import { useEffect } from 'react';
import { useAppStore } from '../../../store/hooks/useAppStore';
import type { ClassDef, RelationType, QueueImage } from '../types/annotation.types';

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const MOCK_CLASSES: ClassDef[] = [
  { id: 'cls-car', name: 'Car', color: '#3b82f6', count: 1 },
  { id: 'cls-ped', name: 'Pedestrian', color: '#ef4444', count: 2 },
  { id: 'cls-light', name: 'Traffic Light', color: '#f59e0b', count: 3 },
  { id: 'cls-sign', name: 'Road Sign', color: '#10b981', count: 0 },
  { id: 'cls-truck', name: 'Truck', color: '#8b5cf6', count: 0 },
];

export const MOCK_RELATION_TYPES: RelationType[] = [
  { id: 'rel-drives', name: 'DRIVES', directed: true },
  { id: 'rel-stops', name: 'STOPS AT', directed: true },
  { id: 'rel-crosses', name: 'CROSSES', directed: true },
  { id: 'rel-follows', name: 'FOLLOWS', directed: true },
];

export const MOCK_QUEUE: QueueImage[] = [
  { 
    asset_id: 'img-1', 
    filename: 'IMG_4821.jpg', 
    asset_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=80&h=80&fit=crop', 
    status: 'PENDING',
    mime_type: 'image/jpeg',
    asset_url_expiry_at: '',
    sam_embedding_url: '',
    sam_embedding_url_expiry_at: '',
    embedding_status: 'PENDING'
  },
  { 
    asset_id: 'img-2', 
    filename: 'IMG_4822.jpg', 
    asset_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=80&h=80&fit=crop', 
    status: 'PENDING',
    mime_type: 'image/jpeg',
    asset_url_expiry_at: '',
    sam_embedding_url: '',
    sam_embedding_url_expiry_at: '',
    embedding_status: 'PENDING'
  },
  { 
    asset_id: 'img-3', 
    filename: 'IMG_4820.jpg', 
    asset_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=80&h=80&fit=crop', 
    status: 'PENDING',
    mime_type: 'image/jpeg',
    asset_url_expiry_at: '',
    sam_embedding_url: '',
    sam_embedding_url_expiry_at: '',
    embedding_status: 'PENDING'
  },
  { 
    asset_id: 'img-4', 
    filename: 'IMG_4819.jpg', 
    asset_url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?w=80&h=80&fit=crop', 
    status: 'PENDING',
    mime_type: 'image/jpeg',
    asset_url_expiry_at: '',
    sam_embedding_url: '',
    sam_embedding_url_expiry_at: '',
    embedding_status: 'PENDING'
  },
  { 
    asset_id: 'img-5', 
    filename: 'IMG_4818.jpg', 
    asset_url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=80&h=80&fit=crop', 
    status: 'PENDING',
    mime_type: 'image/jpeg',
    asset_url_expiry_at: '',
    sam_embedding_url: '',
    sam_embedding_url_expiry_at: '',
    embedding_status: 'PENDING'
  },
  { 
    asset_id: 'img-6', 
    filename: 'IMG_4817.jpg', 
    asset_url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=80&h=80&fit=crop', 
    status: 'PENDING',
    mime_type: 'image/jpeg',
    asset_url_expiry_at: '',
    sam_embedding_url: '',
    sam_embedding_url_expiry_at: '',
    embedding_status: 'PENDING'
  },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAnnotationData() {
  const setAnnotatedObjects = useAppStore(state => state.setAnnotatedObjects);
  const setObjectRelations = useAppStore(state => state.setObjectRelations);

  useEffect(() => {
    // Seed the store with mock data on mount
    setAnnotatedObjects([
      {
        id: 'obj-1',
        label: 'Car_01',
        classId: 'cls-car',
        type: 'bbox',
        color: '#3b82f6',
        coordinates: [452, 320, 160, 120],
        zIndex: 2,
        visible: true,
        locked: false,
      },
      {
        id: 'obj-2',
        label: 'Pedestrian_03',
        classId: 'cls-ped',
        type: 'bbox',
        color: '#f59e0b',
        coordinates: [210, 180, 80, 130],
        zIndex: 1,
        visible: true,
        locked: false,
      },
    ]);
    setObjectRelations([
      {
        id: 'rel-1',
        sourceId: 'obj-2',
        sourceLabel: 'Pedestrian_03',
        targetId: 'obj-1',
        targetLabel: 'Car_01',
        relationTypeId: 'rel-drives',
        relationTypeName: 'DRIVES',
      },
    ]);
  }, [setAnnotatedObjects, setObjectRelations]);

  return {
    classes: MOCK_CLASSES,
    relationTypes: MOCK_RELATION_TYPES,
    queue: MOCK_QUEUE,
    totalImages: 1024,
  };
}
