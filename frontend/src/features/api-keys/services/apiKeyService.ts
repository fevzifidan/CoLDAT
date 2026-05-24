// FEVZİ'NİN UYARISI: Ham axios ve hardcoded URL'ler temizlendi, merkezi apiService'e bağlandı.
import apiService from '@/shared/services/api/api.service';

export interface ApiKey {
  id: string;
  name: string;
  api_key?: string;
  created_at: string;
  is_active: boolean;
  expires_at?: string;
}

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"; 

const MOCK_API_KEYS: ApiKey[] = [
  { id: "key_1", name: "Production Key (Yedek Mod)", api_key: "sk_live_prod_••••••••••••••••••••", created_at: "2026-05-20T10:00:00Z", is_active: true }
];

const getTargetId = (datasetId: string) => {
  return (datasetId === "default-dataset-id" || !datasetId) ? VALID_UUID : datasetId;
};

export const apiKeyService = {
  saveExternalKey: (key: string): void => localStorage.setItem('ai_api_key', key),
  getExternalKey: (): string => localStorage.getItem('ai_api_key') || '',
  clearExternalKey: (): void => localStorage.removeItem('ai_api_key'),

  getApiKeys: async (datasetId: string): Promise<ApiKey[]> => {
    const targetId = getTargetId(datasetId);
    try {
      // Artık istek /datasets/... ile relative başlıyor ve token otomatik ekleniyor
      const res = await apiService.get(`/datasets/${targetId}/api-keys/`);
      return res.data || res;
    } catch (error) {
      console.error("Backend bağlantı hatası:", error);
      return MOCK_API_KEYS;
    }
  },

  createApiKey: async (datasetId: string, keyData: { name: string; expires_in_days?: number }): Promise<ApiKey> => {
    const targetId = getTargetId(datasetId);
    try {
      const res = await apiService.post(`/datasets/${targetId}/api-keys/`, keyData);
      return res.data || res;
    } catch (error) {
      return { id: "mock_" + Date.now(), name: keyData.name, api_key: "sk_live_...", created_at: new Date().toISOString(), is_active: true };
    }
  },

  revealApiKey: async (datasetId: string, keyId: string): Promise<ApiKey> => {
    const targetId = getTargetId(datasetId);
    try {
      const res = await apiService.get(`/datasets/${targetId}/api-keys/${keyId}/reveal/`);
      return res.data || res;
    } catch (error) {
      return { id: keyId, name: "Revealed Key", api_key: "sk_live_actual_key...", created_at: new Date().toISOString(), is_active: true };
    }
  },

  deleteApiKey: async (datasetId: string, keyId: string): Promise<void> => {
    const targetId = getTargetId(datasetId);
    try {
      await apiService.delete(`/datasets/${targetId}/api-keys/${keyId}/`);
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  }
};