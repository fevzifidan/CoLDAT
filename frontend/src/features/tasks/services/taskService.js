import apiService from "@/shared/services/api/api.service";

export const taskService = {
  /**
   * GET /projects/{projectId}/tasks/
   * Proje seviyesindeki tüm task'ları cursor-based pagination ile listeler.
   * @param {string} projectId
   * @param {Object} [params] - { limit?: number, after?: string | null, status?: string }
   */
    /**
   * GET /projects/{projectId}/tasks/
   * Proje seviyesindeki tüm task'ları cursor-based pagination ile listeler.
   * API spec response: { data: Task[], next_cursor: string | null }
   */
  getProjectTasks: async (projectId, params = {}) => {
    const response = await apiService.get(`/projects/${projectId}/tasks/`, { params });
    return response;
  },

  /**
   * GET /tasks/
   * Assigned tasks (dashboard list)
   * API spec response: { data: Task[], next_cursor: string | null }
   */
  getTasks: async (params = {}) => {
    const response = await apiService.get('/tasks/', { params });
    return response;
  },

  /**
   * GET /tasks/{taskId}/
   * Task detail
   * API spec response: Single Task object
   */
  getTaskById: async (taskId) => {
    const response = await apiService.get(`/tasks/${taskId}/`);
    return response;
  },

  /**
   * POST /tasks/
   * Admin assigns batch of images
   * Payload: { dataset_id, assignee_id, role, image_ids[], note? }
   * API spec response: 201 Created (Task object)
   */
  createTask: async (payload) => {
    const response = await apiService.post('/tasks/', payload);
    return response;
  },

  /**
   * PATCH /tasks/{taskId}/status/
   * Submit / Approve / Reject
   */
  updateTaskStatus: async (taskId, payload) => {
    const response = await apiService.patch(`/tasks/${taskId}/status/`, payload);
    return response;
  },

  /**
   * PATCH /tasks/{taskId}/assign/
   * Admin reassignment
   */
  reassignTask: async (taskId, payload) => {
    const response = await apiService.patch(`/tasks/${taskId}/assign/`, payload);
    return response;
  },

  /**
   * DELETE /tasks/{taskId}/
   * Revoke task
   */
  deleteTask: async (taskId) => {
    const response = await apiService.delete(`/tasks/${taskId}/`);
    return response;
  },

    /**
   * POST /tasks/{taskId}/images/
   * Add assets to an existing task
   */
  addAssetsToTask: async (taskId, payload) => {
    const response = await apiService.post(
      `/tasks/${taskId}/images/`,
      payload
    );
    return response;
  },

  /**
   * GET /tasks/{taskId}/images/
   * Get paginated images for a task (cursor-based pagination)
   * API spec response: { data: TaskImage[], next_cursor: string | null }
   */
  getTaskImages: async (taskId, { limit = 50, after = null } = {}) => {
    const params = { limit };
    if (after) params.after = after;
    const response = await apiService.get(`/tasks/${taskId}/images/`, { params });
    return response;
  }
};

// UserLookup, datasetMember, datasetTask servisleri ayrı dosyalara bölündü:
// - ./userLookupService.ts
// - ../datasets/services/datasetMemberService.ts
// - ../datasets/services/datasetTaskService.ts

