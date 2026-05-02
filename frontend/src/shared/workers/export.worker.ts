/**
 * export.worker.ts
 * 
 * Web Worker for handling annotation export conversions.
 */
import { 
  convertToCOCO, 
  convertToYOLO, 
  convertToVisualGenome, 
  type ExportData 
} from '../utils/exportConverters';

self.onmessage = (e: MessageEvent<{ data: ExportData; format: 'coco' | 'yolo' | 'visual_genome' }>) => {
  const { data, format } = e.data;
  
  try {
    let result = '';
    
    switch (format) {
      case 'coco':
        result = convertToCOCO(data);
        break;
      case 'yolo':
        result = convertToYOLO(data);
        break;
      case 'visual_genome':
        result = convertToVisualGenome(data);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    // Simulate a small delay for demo/testing purposes if needed, 
    // but usually we want it as fast as possible.
    // setTimeout(() => self.postMessage({ result, success: true }), 500);
    
    self.postMessage({ result, success: true });
  } catch (error) {
    self.postMessage({ error: (error as Error).message, success: false });
  }
};
