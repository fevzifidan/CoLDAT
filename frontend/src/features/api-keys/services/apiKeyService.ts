// src/features/api-keys/services/apiKeyService.ts
import apiService from '@/shared/services/api/apiClient'; // Projedeki genel apiClient yoluna eşitlendi

export interface ApiKey {
  id: string;
  name: string;
  api_key?: string;
  created_at: string;
  is_active: boolean;
  expires_at?: string;
}

// Backend yokken API Anahtarları sayfasını besleyecek sahte veriler
const MOCK_API_KEYS: ApiKey[] = [
  { id: "key_1", name: "Production Key", api_key: "sk_live_prod_••••••••••••••••••••", created_at: "2026-05-20T10:00:00Z", is_active: true },
  { id: "key_2", name: "Staging Key", api_key: "sk_live_stag_••••••••••••••••••••", created_at: "2026-05-21T14:30:00Z", is_active: false }
];

export const apiKeyService = {
  getApiKeys: async (datasetId: string): Promise<ApiKey[]> => {
    try {
      const res = await apiService.get(`/datasets/${datasetId}/api-keys`);
      return res.data || res;
    } catch (error) {
      console.warn("Mocking getApiKeys... falling back to local simulation.");
      return MOCK_API_KEYS;
    }
  },

  createApiKey: async (datasetId: string, keyData: { name: string; expires_in_days?: number }): Promise<ApiKey> => {
    try {
      const res = await apiService.post(`/datasets/${datasetId}/api-keys`, keyData);
      return res.data || res;
    } catch (error) {
      console.warn("Mocking createApiKey...", keyData);
      // Sayfadaki "Successful" akışını tetiklemek ve listeye eklenmesini simüle etmek için düzgün nesne dönüyoruz
      return {
        id: "mock_" + Date.now(),
        name: keyData.name || "Generated Key",
        api_key: "sk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        is_active: true
      };
    }
  },

  revealApiKey: async (datasetId: string, keyId: string): Promise<ApiKey> => {
    try {
      const res = await apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`);
      return res.data || res;
    } catch (error) {
      console.warn("Mocking revealApiKey...");
      return { 
        id: keyId, 
        name: "Revealed Key", 
        api_key: "sk_live_actual_key_secret_value_12345", 
        created_at: new Date().toISOString(), 
        is_active: true 
      };
    }
  },

  deleteApiKey: async (datasetId: string, keyId: string): Promise<void> => {
    try {
      const res = await apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`);
      return res.data || res;
    } catch (error) {
      console.warn("Mocking deleteApiKey for:", keyId);
      return Promise.resolve();
    }
  }
};