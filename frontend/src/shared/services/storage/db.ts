import Dexie, { type Table } from 'dexie';
import { type IUser, type IImages, type IAssetUploads, type IContextMetadata, type IPaginatedItem } from './types';

export class AppDatabase extends Dexie {
  // 1. Tablo tiplerini tanımlıyoruz
  users!: Table<IUser>;
  images!: Table<IImages>;
  uploads!: Table<IAssetUploads>;
  items!: Table<IPaginatedItem>;      // Pagination referans tablosu
  contexts!: Table<IContextMetadata>; // Pagination metadata tablosu

  constructor() {
    super('MyAppPaginationDB');

    // 2. Şemayı tanımlıyoruz
    // Sol taraftaki isimler (items, contexts) kodda db.items veya db.contexts 
    // şeklinde erişilen tablo isimleridir.
    this.version(1).stores({
      users: '++id, username',
      images: 'asset_id, dataset_id, status',
      uploads: 'upload_id, status',
      
      // Pagination Tablosu: [contextId+index] bileşik indeksi
      items: 'id, [contextId+index], dataId, itemType',
      
      // Context Metadata Tablosu: contextId primary key (PK)
      contexts: 'contextId' 
    });
  }
}

// Singleton instance
export const db = new AppDatabase();