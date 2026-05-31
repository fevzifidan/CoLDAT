import apiService from '@/shared/services/api/api.service';

export interface AdminDataset {
  id: string;
  name: string;
  project_id?: string;
  description?: string;
  role: string;
}

export interface DatasetListResponse {
  data: AdminDataset[];
  next_cursor: string | null;
}

export const datasetAdminService = {
  // GET /datasets/ (tüm erişilebilir dataset'ler)
  list: async (params?: { limit?: number; after?: string | null }): Promise<DatasetListResponse> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.after) query.set('after', params.after);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiService.get(`/datasets/${qs}`);
  },
};
