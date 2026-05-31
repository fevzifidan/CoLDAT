// FEVZİ'NİN UYARISI: Ham axios ve hardcoded URL'ler temizlendi, merkezi apiService'e bağlandı.
import apiService from '@/shared/services/api/api.service';

export interface ApiKey {
  id: string;
  name: string;
  api_key?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  target_version?: string;
}

export interface CreateApiKeyPayload {
  name: string;
  ttl_days?: number;
  target_version?: string;
}

export interface UpdateApiKeyPayload {
  name?: string;
  ttl_days?: number;
  is_active?: boolean;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  next_cursor: string | null;
}

export interface RevealApiKeyResponse {
  id: string;
  name: string;
  api_key: string;
  warning?: string;
}
export const apiKeyService = {
  // GET /datasets/{datasetId}/api-keys/
  list: async (
    datasetId: string,
    params?: { limit?: number; after?: string | null }
  ): Promise<ApiKeyListResponse> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.after) query.set('after', params.after);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiService.get(`/datasets/${datasetId}/api-keys/${qs}`);
  },

  // POST /datasets/{datasetId}/api-keys/
  create: async (datasetId: string, payload: CreateApiKeyPayload): Promise<RevealApiKeyResponse> => {
    return apiService.post(`/datasets/${datasetId}/api-keys/`, payload);
  },

  // GET /datasets/{datasetId}/api-keys/{keyId}/reveal/
  reveal: async (datasetId: string, keyId: string): Promise<RevealApiKeyResponse> => {
    return apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal/`);
  },

  // PATCH /datasets/{datasetId}/api-keys/{keyId}/
  update: async (datasetId: string, keyId: string, payload: UpdateApiKeyPayload): Promise<ApiKey> => {
    return apiService.patch(`/datasets/${datasetId}/api-keys/${keyId}/`, payload);
  },

  // DELETE /datasets/{datasetId}/api-keys/{keyId}/
  revoke: async (datasetId: string, keyId: string): Promise<void> => {
    return apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}/`);
  },

  // POST /datasets/{datasetId}/api-keys/actions/revoke-all/
  revokeAll: async (datasetId: string): Promise<{ message: string; revoked_count: number }> => {
    return apiService.post(`/datasets/${datasetId}/api-keys/actions/revoke-all/`);
  },
};