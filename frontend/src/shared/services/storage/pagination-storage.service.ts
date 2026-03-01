import { db } from './db';
import { type IPaginatedItem, type IContextMetadata, type IImages, type IUser, type IAssetUploads } from './types';

// Hangi itemType'ın hangi tabloya karşılık geldiğini belirleyen yardımcı tip
type TableName = 'images' | 'users' | 'uploads';

export class PaginationStorageService {
  
  /**
   * API'den gelen verileri hem kendi tablolarına hem de pagination tablosuna ekler.
   * @param itemType Verinin hangi kategoriye ait olduğu ('image' | 'user' | 'upload')
   */
  async upsertPage<T extends { id: string }>(
    contextId: string, 
    items: T[], 
    nextCursor: string | null,
    itemType: 'image' | 'user' | 'upload'
  ) {
    // Transaction'a ilgili tüm tabloları dahil ediyoruz
    const targetTable: TableName = itemType === 'image' ? 'images' : itemType === 'user' ? 'users' : 'uploads';

    return await db.transaction('rw', [db.items, db.contexts, db[targetTable]], async () => {
      // 1. Context bilgisini al/oluştur
      let context = await db.contexts.get(contextId);
      if (!context) {
        context = { contextId, nextCursor: null, totalItems: 0, lastSync: Date.now() };
      }

      const startIndex = context.totalItems;

      // 2. Asıl verileri (Images/Users vb.) kendi tablosuna kaydet
      // Not: bulkPut çakışma varsa günceller (UUIDv7 sayesinde güvenli)
      await (db[targetTable] as any).bulkPut(items);

      // 3. Pagination (Referans) tablosunu doldur
      const paginationRefs: IPaginatedItem[] = items.map((item, i) => ({
        id: crypto.randomUUID(), // Pagination kaydının kendi ID'si (veya UUIDv7)
        contextId,
        index: startIndex + i,
        dataId: item.id, // Asıl verinin ID'si (FK)
        itemType,
        createdAt: Date.now()
      }));

      await db.items.bulkPut(paginationRefs);

      // 4. Context metadata güncelle
      await db.contexts.put({
        ...context,
        nextCursor,
        totalItems: startIndex + items.length,
        lastSync: Date.now()
      });
    });
  }

  /**
   * Belirli bir aralıktaki verileri "Join" yaparak getirir.
   */
  async getItemsByIndexRange<T>(
    contextId: string, 
    start: number, 
    limit: number
  ): Promise<(IPaginatedItem & { data: T | undefined })[]> {
    
    // 1. Önce referansları getir
    const refs = await db.items
      .where('[contextId+index]')
      .between([contextId, start], [contextId, start + limit - 1], true, true)
      .toArray();

    if (refs.length === 0) return [];

    // 2. dataId'leri topla ve ilgili tablodan asıl verileri çek
    // Not: Bir context genellikle tek tip veri tutar (örn. hepsi 'image')
    const itemType = refs[0].itemType;
    const targetTable: TableName = itemType === 'image' ? 'images' : itemType === 'user' ? 'users' : 'uploads';
    
    const dataIds = refs.map(r => r.dataId);
    const actualData = await (db[targetTable] as any).bulkGet(dataIds);

    // 3. Verileri birleştir (Join)
    return refs.map((ref, i) => ({
      ...ref,
      data: actualData[i] as T
    }));
  }

  /**
   * Asıl veriyi (IImages, IUser vb.) günceller. 
   * Normalize yapı sayesinde burada yapılan güncelleme tüm context'lere yansır.
   */
  async updateDomainData(itemType: 'image' | 'user' | 'upload', id: string, updates: any) {
    const targetTable: TableName = itemType === 'image' ? 'images' : itemType === 'user' ? 'users' : 'uploads';
    
    // Sadece asıl verinin olduğu tabloyu güncelliyoruz
    await (db[targetTable] as any).update(id, {
      ...updates,
      // Eğer domain modelinde bir updatedAt varsa güncellenebilir
    });
  }

  /**
   * Pagination imlecini getirir
   */
  async getNextCursor(contextId: string): Promise<string | null> {
    const context = await db.contexts.get(contextId);
    return context?.nextCursor || null;
  }

  /**
   * Sadece pagination referansını siler (Asıl veriyi silmez)
   */
  async removeReference(paginationId: string) {
    await db.items.delete(paginationId);
  }

  /**
   * Hem referansı hem de asıl veriyi siler (Dikkatli kullanılmalı)
   */
  async fullyDeleteItem(itemType: 'image' | 'user' | 'upload', dataId: string) {
    const targetTable: TableName = itemType === 'image' ? 'images' : itemType === 'user' ? 'users' : 'uploads';
    
    return await db.transaction('rw', [db.items, db[targetTable]], async () => {
      // Tüm context'lerdeki referanslarını sil
      await db.items.where('dataId').equals(dataId).delete();
      // Asıl veriyi sil
      await (db[targetTable] as any).delete(dataId);
    });
  }

  async clearContext(contextId: string) {
    await db.transaction('rw', [db.items, db.contexts], async () => {
      await db.items.where('contextId').equals(contextId).delete();
      await db.contexts.delete(contextId);
    });
  }
}

export const paginationStorage = new PaginationStorageService();