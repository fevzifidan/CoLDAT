import apiService from "@/shared/services/api/api.service";

export const taskService = {
  /**
   * GET /projects/{projectId}/tasks/
   * Proje seviyesindeki tüm task'ları cursor-based pagination ile listeler.
   * @param {string} projectId
   * @param {Object} [params] - { limit?: number, after?: string | null, status?: string }
   */
  getProjectTasks: async (projectId, params = {}) => {
    const response = await apiService.get(`/projects/${projectId}/tasks/`, { params });
    return response.data || response;
  },

  /**
   * GET /tasks/
   * Assigned tasks (dashboard list)
   */
  getTasks: async (params = {}) => {
    const response = await apiService.get('/tasks/', { params });
    return response.data;
  },

  /**
   * GET /tasks/{taskId}/
   * Task detail
   */
  getTaskById: async (taskId) => {
    const response = await apiService.get(`/tasks/${taskId}/`);
    return response.data;
  },

  /**
   * POST /tasks/
   * Admin assigns batch of images
   * Payload: { dataset_id, assignee_id, role, image_ids[], note? }
   */
  createTask: async (payload) => {
    const response = await apiService.post('/tasks/', payload);
    return response.data;
  },

  /**
   * PATCH /tasks/{taskId}/status/
   * Submit / Approve / Reject
   */
  updateTaskStatus: async (taskId, payload) => {
    const response = await apiService.patch(`/tasks/${taskId}/status/`, payload);
    return response.data;
  },

  /**
   * PATCH /tasks/{taskId}/assign/
   * Admin reassignment
   */
  reassignTask: async (taskId, payload) => {
    const response = await apiService.patch(`/tasks/${taskId}/assign/`, payload);
    return response.data;
  },

  /**
   * DELETE /tasks/{taskId}/
   * Revoke task
   */
  deleteTask: async (taskId) => {
    const response = await apiService.delete(`/tasks/${taskId}/`);
    return response.data;
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
    return response.data;
  },

  /**
   * GET /tasks/{taskId}/images/
   * Get paginated images for a task (cursor-based pagination)
   * Response: { data: TaskImage[], next_cursor: string | null }
   */
  getTaskImages: async (taskId, { limit = 50, after = null } = {}) => {
    const params = { limit };
    if (after) params.after = after;
    const response = await apiService.get(`/tasks/${taskId}/images/`, { params });
    return response.data;
  }
};

/**
 * User lookup service for Create Task flow
 * GET /users/lookup?username=<exact_username>
 * Returns the user if found, 404 otherwise.
 */
export const userLookupService = {
  /**
   * Lookup a user by exact username.
   * @param {string} username - Exact username to search
   * @returns {Promise<{id: string, username: string, first_name?: string, last_name?: string}>}
   */
  lookup: async (username) => {
    return apiService.get(`/users/lookup?username=${encodeURIComponent(username)}`, { silent: true });
  }
};

/**
 * Dataset member service
 */
export const datasetMemberService = {
  /**
   * GET /datasets/{datasetId}/members/
   * Lists all members of a dataset
   */
  getMembers: async (datasetId, { cursor = null, limit = 100 } = {}) => {
    const params = { limit };
    if (cursor) params.after = cursor;
    return apiService.get(`/datasets/${datasetId}/members/`, { params, silent: true });
  },

  /**
   * POST /datasets/{datasetId}/members/
   * Adds a new member to the dataset
   * Body: { username: string, role: "annotator" | "viewer" }
   */
  addMember: async (datasetId, payload) => {
    return apiService.post(`/datasets/${datasetId}/members/`, payload, { silent: true });
  },

  /**
   * DELETE /datasets/{datasetId}/members?userId=<userId>
   * Removes a member from the dataset
   */
  removeMember: async (datasetId, userId) => {
    return apiService.delete(`/datasets/${datasetId}/members/?userId=${userId}`, { silent: true });
  }
};

/**
 * Service to fetch dataset images and task assignment data
 */
export const datasetTaskService = {
  /**
   * GET /datasets/{datasetId}/images/
   * Paginated image list for a dataset
   */
  getDatasetImages: async (datasetId, { cursor = null, search = '', limit = 50 } = {}) => {
    const params = { limit };
    if (cursor) params.after = cursor;
    if (search) params.search = search;
    return apiService.get(`/datasets/${datasetId}/images/`, { params, silent: true });
  },

  /**
   * GET /datasets/{datasetId}/tasks/
   * Returns all tasks in a dataset for conflict detection
   */
  getDatasetTasks: async (datasetId, { cursor = null, limit = 100 } = {}) => {
    const params = { limit };
    if (cursor) params.after = cursor;
    return apiService.get(`/datasets/${datasetId}/tasks/`, { params, silent: true });
  },

  /**
   * GET /datasets/{datasetId}/annotator-assignments/
   * Returns a map of asset_id -> assignee_username for all annotator tasks.
   * This endpoint is provided by the backend for efficient conflict detection.
   *
   * Expected response:
   * {
   *   data: [
   *     { asset_id: "uuid", assignee_username: "johndoe" },
   *     ...
   *   ],
   *   next_cursor: string | null
   * }
   */
  getAnnotatorAssignments: async (datasetId, { cursor = null, limit = 100 } = {}) => {
    const params = { limit };
    if (cursor) params.after = cursor;
    return apiService.get(`/datasets/${datasetId}/annotator-assignments/`, { params, silent: true });
  }
};

