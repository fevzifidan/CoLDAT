import apiService from "@/shared/services/api/api.service";

export const taskService = {

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
   * Add assets to task
   */
  addAssetsToTask: async (taskId, payload) => {
    const response = await apiService.post(
      `/tasks/${taskId}/images/`,
      payload
    );
    return response.data;
  }
};