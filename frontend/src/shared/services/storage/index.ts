/**
 * Storage Service Entry Point
 */

// 1. Tüm tip tanımlarını dışa aktar
export * from './types';

// 2. Veritabanı instance'ını dışa aktar 
// (Bileşenlerde liveQuery kullanabilmek için bu gereklidir)
export { db } from './db';

// 3. Pagination Servisini "storage" takma adıyla dışa aktar
import { paginationStorage as storage } from './pagination-storage.service';

export default storage;