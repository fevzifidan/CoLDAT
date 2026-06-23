import apiService from "@/shared/services/api/api.service";

/**
 * Service to fetch dataset images and task assignment data
 */
export const datasetTaskService = {
  /**
   * GET /datasets/{datasetId}/images/
   * Paginated image list for a dataset
   */
  getDatasetImages: async (datasetId: string, { cursor = null, search = '', limit = 50 }: { cursor?: string | null; search?: string; limit?: number } = {}) => {
    const params: Record<string, any> = { limit };
    if (cursor) params.after = cursor;
    if (search) params.search = search;
    return apiService.get(`/datasets/${datasetId}/images/`, { params, silent: true } as any);
  },

  /**
   * GET /datasets/{datasetId}/tasks/
   * Returns all tasks in a dataset for conflict detection
   */
  getDatasetTasks: async (datasetId: string, { cursor = null, limit = 100 }: { cursor?: string | null; limit?: number } = {}) => {
    const params: Record<string, any> = { limit };
    if (cursor) params.after = cursor;
    return apiService.get(`/datasets/${datasetId}/tasks/`, { params, silent: true } as any);
  },

  /**
   * GET /datasets/{datasetId}/annotator-assignments/
   * Returns a map of asset_id -> assignee_username for all annotator tasks.
   */
  getAnnotatorAssignments: async (datasetId: string, { cursor = null, limit = 100 }: { cursor?: string | null; limit?: number } = {}) => {
    const params: Record<string, any> = { limit };
    if (cursor) params.after = cursor;
    return apiService.get(`/datasets/${datasetId}/annotator-assignments/`, { params, silent: true } as any);
  }
};
