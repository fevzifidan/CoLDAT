// FEVZİ'NİN UYARISI: Ham axios ve hardcoded URL'ler temizlendi, merkezi apiService'e bağlandı.
import apiService from '@/shared/services/api/api.service';

// ----- LIST Response (GET /datasets/{datasetId}/api-keys/) -----
// YAML: id, name, api_key (maskelenmiş), created_at, expires_at, is_active
export interface ApiKey {
  id: string;
  name: string;
  api_key?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

// ----- CREATE Request (POST /datasets/{datasetId}/api-keys/) -----
export interface CreateApiKeyPayload {
  name: string;
  ttl_days?: number;
  target_version?: string;
}

// ----- CREATE Response (POST /datasets/{datasetId}/api-keys/) -----
// YAML: id, key (tam değer), target_version, expires_at
export interface CreateApiKeyResponse {
  id: string;
  raw_key: string;
  target_version?: string;
  expires_at?: string;
}

// ----- UPDATE Request (PATCH /datasets/{datasetId}/api-keys/{keyId}) -----
export interface UpdateApiKeyPayload {
  name?: string;
  ttl_days?: number;
  is_active?: boolean;
}

// ----- UPDATE Response (PATCH /datasets/{datasetId}/api-keys/{keyId}) -----
// YAML: id, name, is_active, expires_at
export interface UpdateApiKeyResponse {
  id: string;
  name: string;
  is_active: boolean;
  expires_at?: string;
}

// ----- REVEAL Response (GET /datasets/{datasetId}/api-keys/{keyId}/reveal) -----
// YAML: id, name, api_key (tam değer), warning
export interface RevealApiKeyResponse {
  id: string;
  name: string;
  api_key: string;
  warning?: string;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  next_cursor: string | null;
}

// ----- REVOKE ALL Response (POST /datasets/{datasetId}/api-keys/actions/revoke-all) -----
export interface RevokeAllResponse {
  message: string;
  revoked_count: number;
}

export const apiKeyService = {
  // GET /datasets/{datasetId}/api-keys
  list: async (
    datasetId: string,
    params?: { limit?: number; after?: string | null }
  ): Promise<ApiKeyListResponse> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.after) query.set('after', params.after);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiService.get(`/datasets/${datasetId}/api-keys${qs}`);
  },

  // POST /datasets/{datasetId}/api-keys
  create: async (datasetId: string, payload: CreateApiKeyPayload): Promise<CreateApiKeyResponse> => {
    return apiService.post(`/datasets/${datasetId}/api-keys`, payload);
  },

  // GET /datasets/{datasetId}/api-keys/{keyId}/reveal
  reveal: async (datasetId: string, keyId: string): Promise<RevealApiKeyResponse> => {
    return apiService.get(`/datasets/${datasetId}/api-keys/${keyId}/reveal`);
  },

  // PATCH /datasets/{datasetId}/api-keys/{keyId}
  update: async (datasetId: string, keyId: string, payload: UpdateApiKeyPayload): Promise<UpdateApiKeyResponse> => {
    return apiService.patch(`/datasets/${datasetId}/api-keys/${keyId}`, payload);
  },

  // DELETE /datasets/{datasetId}/api-keys/{keyId}
  revoke: async (datasetId: string, keyId: string): Promise<void> => {
    return apiService.delete(`/datasets/${datasetId}/api-keys/${keyId}`);
  },

  // POST /datasets/{datasetId}/api-keys/actions/revoke-all
  revokeAll: async (datasetId: string): Promise<RevokeAllResponse> => {
    return apiService.post(`/datasets/${datasetId}/api-keys/actions/revoke-all`);
  },
};