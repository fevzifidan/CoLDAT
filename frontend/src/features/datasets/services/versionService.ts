// frontend/src/features/datasets/services/versionService.ts
import apiService from "@/shared/services/api/api.service";

export interface DatasetVersion {
  id: string;
  dataset_id: string;
  version_tag: string;
  description: string;
  created_by_id: string;
  created_by_username: string;
  created_at: string;
}

export interface DatasetVersionDetail extends DatasetVersion {
  snapshot: Record<string, unknown>;
}

export interface RestorePayload {
  mode: "create_new" | "replace";
}

export const versionService = {
  /**
   * GET /datasets/{datasetId}/versions
   * Dataset'in tüm versiyonlarını listeler.
   */
  getVersions: async (datasetId: string): Promise<{ data: DatasetVersion[]; next_cursor: string | null }> => {
    const response = await apiService.get(`/datasets/${datasetId}/versions`);
    // Interceptor response.data döndürür: { data: [...], next_cursor: null }
    return response;
  },

  /**
   * GET /datasets/{datasetId}/versions/{versionTag}
   * Belirli bir versiyonun detayını getirir.
   */
  getVersion: async (
    datasetId: string,
    versionTag: string
  ): Promise<DatasetVersionDetail> => {
    const response = await apiService.get(
      `/datasets/${datasetId}/versions/${versionTag}`
    );
    // Interceptor response.data döndürür: { id, dataset_id, ..., snapshot }
    return response;
  },

  /**
   * POST /datasets/{datasetId}/versions/{versionTag}/restore/
   * Bir versiyon snapshot'ından geri yükleme yapar.
   */
  restoreVersion: async (
    datasetId: string,
    versionTag: string,
    payload: RestorePayload
  ): Promise<DatasetVersion> => {
    const response = await apiService.post(
      `/datasets/${datasetId}/versions/${versionTag}/restore/`,
      payload
    );
    // Interceptor response.data döndürür: { id, dataset_id, ..., version_tag }
    return response;
  },
};

