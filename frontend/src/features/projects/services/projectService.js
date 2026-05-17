// default export olarak apiClient'ı apiService takma adıyla içeri alıyoruz
import apiService from '@/shared/services/api/apiClient';

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {'object_detection' | 'entity_recognition' | 'semantic_relation'} project_type
 * @property {string} dataset_id
 * @property {string} created_at
 * @property {string} [status]
 * @property {string} [role]
 * @property {string} [type]
 * @property {any} [task]
 * @property {any} [count]
 */

export const projectService = {
  /**
   * 1. Tüm projeleri listele (GET /projects)
   * @returns {Promise<Project[]>}
   */
  getAllProjects: () => {
    return apiService.get('/projects');
  },

  /**
   * 2. Yeni proje oluştur (POST /projects)
   * @param {Object} projectData
   * @returns {Promise<Project>}
   */
  createProject: (projectData) => {
    return apiService.post('/projects', projectData);
  },

  /**
   * 3. Proje detayını getir (GET /projects/{id})
   * @param {string} id
   * @returns {Promise<Project>}
   */
  getProjectById: (id) => {
    return apiService.get(`/projects/${id}`);
  },

  /**
   * 4. Projeyi sil (DELETE /projects/{id})
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteProject: (id) => {
    return apiService.delete(`/projects/${id}`);
  }
};