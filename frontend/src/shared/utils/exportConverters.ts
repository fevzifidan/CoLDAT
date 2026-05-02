/**
 * exportConverters.ts
 * 
 * Utility functions to convert internal annotation state to various standard formats.
 */
import type { AnnotatedObject, ObjectRelation } from '@/features/annotation/types/annotation.types';

export interface ExportData {
  objects: AnnotatedObject[];
  relations: ObjectRelation[];
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  classNames: string[];
}

/**
 * Converts data to COCO format (Single image version)
 */
export function convertToCOCO(data: ExportData): string {
  const categories = Array.from(new Set(data.objects.map(obj => obj.classId))).map((id, index) => ({
    id: index + 1,
    name: data.objects.find(obj => obj.classId === id)?.label.split('_')[0] || 'unknown',
    supercategory: 'none'
  }));

  const coco = {
    images: [{
      id: 1,
      width: data.imageWidth,
      height: data.imageHeight,
      file_name: data.imageName
    }],
    annotations: data.objects.map((obj, index) => {
      const category = categories.find(c => c.name === obj.label.split('_')[0]);
      
      let bbox: number[] = [];
      let segmentation: number[][] = [];
      let area = 0;

      if (obj.type === 'bbox') {
        bbox = obj.coordinates; // [x, y, w, h]
        area = bbox[2] * bbox[3];
      } else if (obj.type === 'polygon') {
        segmentation = [obj.coordinates];
        // Simplified area calculation for polygons (min-max bbox area)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < obj.coordinates.length; i += 2) {
          minX = Math.min(minX, obj.coordinates[i]);
          minY = Math.min(minY, obj.coordinates[i+1]);
          maxX = Math.max(maxX, obj.coordinates[i]);
          maxY = Math.max(maxY, obj.coordinates[i+1]);
        }
        bbox = [minX, minY, maxX - minX, maxY - minY];
        area = bbox[2] * bbox[3];
      }

      return {
        id: index + 1,
        image_id: 1,
        category_id: category?.id || 0,
        segmentation,
        area,
        bbox,
        iscrowd: 0
      };
    }),
    categories
  };

  return JSON.stringify(coco, null, 2);
}

/**
 * Converts data to YOLO format (Single image version)
 * One line per object: <class_id> <x_center> <y_center> <width> <height>
 * Values are normalized 0.0 to 1.0.
 */
export function convertToYOLO(data: ExportData): string {
  return data.objects.map(obj => {
    const classId = data.classNames.indexOf(obj.label.split('_')[0]);
    
    let x = 0, y = 0, w = 0, h = 0;

    if (obj.type === 'bbox') {
      [x, y, w, h] = obj.coordinates;
    } else if (obj.type === 'polygon') {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < obj.coordinates.length; i += 2) {
        minX = Math.min(minX, obj.coordinates[i]);
        minY = Math.min(minY, obj.coordinates[i+1]);
        maxX = Math.max(maxX, obj.coordinates[i]);
        maxY = Math.max(maxY, obj.coordinates[i+1]);
      }
      x = minX;
      y = minY;
      w = maxX - minX;
      h = maxY - minY;
    }

    const xCenter = (x + w / 2) / data.imageWidth;
    const yCenter = (y + h / 2) / data.imageHeight;
    const width = w / data.imageWidth;
    const height = h / data.imageHeight;

    return `${classId} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`;
  }).join('\n');
}

/**
 * Converts data to Visual Genome format (Simplified for single image)
 */
export function convertToVisualGenome(data: ExportData): string {
  const vg = {
    image_id: 1,
    objects: data.objects.map(obj => ({
      object_id: obj.id,
      x: obj.type === 'bbox' ? obj.coordinates[0] : 0, // Simplified for polygons
      y: obj.type === 'bbox' ? obj.coordinates[1] : 0,
      w: obj.type === 'bbox' ? obj.coordinates[2] : 0,
      h: obj.type === 'bbox' ? obj.coordinates[3] : 0,
      names: [obj.label.split('_')[0]],
      synsets: []
    })),
    relationships: data.relations.map((rel, index) => ({
      relationship_id: index + 1,
      predicate: rel.relationTypeName,
      subject_id: rel.sourceId,
      object_id: rel.targetId,
      synsets: []
    }))
  };

  return JSON.stringify(vg, null, 2);
}
