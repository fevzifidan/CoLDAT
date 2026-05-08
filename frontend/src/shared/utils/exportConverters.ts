/**
 * exportConverters.ts
 * 
 * Utility functions to convert internal annotation state to various standard formats.
 */
import type { AnnotatedObject, ObjectRelation } from '@/features/annotation/types/annotation.types';
import type { Taxonomy } from '../store/contextSlice';

export interface ExportData {
  objects: AnnotatedObject[];
  relations: ObjectRelation[];
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  taxonomy: Taxonomy;
}

/**
 * Converts data to COCO format (Single image version)
 */
export function convertToCOCO(data: ExportData): string {
  // Only include classes marked for export (default to true if undefined)
  const exportableClasses = data.taxonomy.classes.filter(c => c.includeInExport !== false);
  const exportableClassIds = new Set(exportableClasses.map(c => c.id));

  const categories = exportableClasses.map(c => ({
    id: c.index + 1, // COCO categories typically start at 1
    name: c.name,
    supercategory: 'none'
  }));

  const coco = {
    images: [{
      id: 1,
      width: data.imageWidth,
      height: data.imageHeight,
      file_name: data.imageName
    }],
    annotations: data.objects
      .filter(obj => exportableClassIds.has(obj.classId))
      .map((obj, index) => {
        const classDef = data.taxonomy.classes.find(c => c.id === obj.classId);
        
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
          category_id: (classDef?.index ?? 0) + 1,
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
  // Only include classes marked for export (default to true if undefined)
  const exportableClasses = data.taxonomy.classes.filter(c => c.includeInExport !== false);
  const exportableClassIds = new Set(exportableClasses.map(c => c.id));

  return data.objects
    .filter(obj => exportableClassIds.has(obj.classId))
    .map(obj => {
      const classDef = data.taxonomy.classes.find(c => c.id === obj.classId);
      const classId = classDef?.index ?? 0;
      
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
  const exportableClasses = data.taxonomy.classes.filter(c => c.includeInExport);
  const exportableClassIds = new Set(exportableClasses.map(c => c.id));
  const exportablePredicates = new Set(data.taxonomy.predicates.filter(p => p.includeInExport).map(p => p.name));

  const vg = {
    image_id: 1,
    objects: data.objects
      .filter(obj => exportableClassIds.has(obj.classId))
      .map(obj => ({
        object_id: obj.id,
        x: obj.type === 'bbox' ? obj.coordinates[0] : 0, // Simplified for polygons
        y: obj.type === 'bbox' ? obj.coordinates[1] : 0,
        w: obj.type === 'bbox' ? obj.coordinates[2] : 0,
        h: obj.type === 'bbox' ? obj.coordinates[3] : 0,
        names: [exportableClasses.find(c => c.id === obj.classId)?.name || 'unknown'],
        synsets: []
      })),
    relationships: data.relations
      .filter(rel => exportablePredicates.has(rel.relationTypeName))
      .map((rel, index) => ({
        relationship_id: index + 1,
        predicate: rel.relationTypeName,
        subject_id: rel.sourceId,
        object_id: rel.targetId,
        synsets: []
      }))
  };

  return JSON.stringify(vg, null, 2);
}
