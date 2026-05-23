// src/features/projects/services/projectService.js
import apiService from '@/shared/services/api/apiClient';

export const projectService = {
  /**
   * 1. Tüm projeleri listele (GET /projects/)
   */
  getAllProjects: async () => {
    // apiService interceptor kullanarak 'Authorization: Bearer <token>' başlığını otomatik ekler
    const response = await apiService.get('projects/');
    // Axios her zaman veriyi .data içinde taşır.
    return response.data;
  },

  /**
   * 2. Yeni proje oluştur (POST /projects/)
   */
  createProject: async (projectData) => {
    const response = await apiService.post('projects/', projectData);
    return response.data;
  },

  /**
   * 3. Proje detayını getir (GET /projects/{id}/)
   */
  getProjectById: async (id) => {
    const response = await apiService.get(`projects/${id}/`);
    return response.data;
  },

  /**
   * 4. Projeyi güncelle (PATCH /projects/{id}/)
   */
  updateProject: async (id, projectData) => {
    const response = await apiService.patch(`projects/${id}/`, projectData);
    return response.data;
  },

  /**
   * 5. Projeyi sil (DELETE /projects/{id}/)
   */
  deleteProject: async (id) => {
    const response = await apiService.delete(`projects/${id}/`);
    return response.data;
  },

  /**
   * ================= MEMBERS ENDPOINTS =================
   */

  /**
   * 6. Proje üyelerini listele (GET /projects/{id}/members/)
   */
  getProjectMembers: async (projectId) => {
    const response = await apiService.get(`projects/${projectId}/members/`);
    return response.data;
  },

  /**
   * 7. Projeye üye ekle (POST /projects/{id}/members/)
   */
  addProjectMember: async (projectId, memberData) => {
    const response = await apiService.post(`projects/${projectId}/members/`, memberData);
    return response.data;
  },

  /**
   * 8. Proje üye rolünü güncelle (PATCH /projects/{id}/members/${membershipId}/)
   */
  updateProjectMember: async (projectId, membershipId, memberData) => {
    const response = await apiService.patch(`projects/${projectId}/members/${membershipId}/`, memberData);
    return response.data;
  },

  /**
   * 9. Projeden üye çıkar (DELETE /projects/{id}/members/${membershipId}/)
   */
  removeProjectMember: async (projectId, membershipId) => {
    const response = await apiService.delete(`projects/${projectId}/members/${membershipId}/`);
    return response.data;
  }
};

// KRİTİK DÜZELTME: Projenin her iki çağırım tarzını da (named/default) desteklemesi için default export ekliyoruz.
export default projectService;