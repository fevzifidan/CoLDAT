// src/features/api-keys/services/apiKeyService.ts
import apiService from '@/shared/services/api/api.service.js';

export interface ApiKey {
  id: string;
  name: string;
  api_key?: string;
  created_at: string;
  is_active: boolean;
  expires_at?: string;
}

export const apiKeyService = {
  /**
   * Bir veri setine ait tüm API anahtarlarını listeler
   */
  getApiKeys: (datasetId: string): Promise<ApiKey[]> => {
    return apiService.get(`/datasets/${datasetId}/api-keys`)
      .then(res => res.data as ApiKey[]); // AxiosResponse içinden datayı ayıklayıp türünü cast ediyoruz
  },

  /**
   * Belirli bir veri seti için yeni bir API anahtarı üretir
   */
  createApiKey: (datasetId: string, keyData: { name: string; expires_in_days?: number }): Promise<ApiKey> => {
    return apiService.post(`/datasets/${datasetId}/api-keys`, keyData)
      .then(res => res.data as ApiKey);
  },

  /**
   * Maskelenmiş API anahtarının gerçek değerini backend'den çeker (Reveal)
   */
  revealApiKey: (datasetId: string, keyId: string): Promise<ApiKey> => {
    return apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`)
      .then(res => res.data as ApiKey);
  },

  /**
   * API anahtarını kalıcı olarak iptal eder/siler (Revoke)
   */
  deleteApiKey: (datasetId: string, keyId: string): Promise<void> => {
    return apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`)
      .then(() => {}); // void sözünü tutmak için boş bir dönüş sağlıyoruz
  }
};