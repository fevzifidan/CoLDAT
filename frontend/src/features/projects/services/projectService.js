// src/features/projects/services/projectService.js
import apiService from '@/shared/services/api/apiClient';

// Backend'de taxonomy endpoint'i hazır olana kadar burayı true tutuyoruz.
// Django tarafında bu rotalar eklendiğinde tek yapman gereken burayı false yapmak!
const IS_TAXONOMY_MOCK = true;

export const projectService = {
  /**
   * 1. Tüm projeleri listele (GET /projects/)
   */
  getAllProjects: async () => {
    // apiClient interceptor zaten response.data'yı dönüyor.
    // O yüzden doğrudan gelen yanıtı yukarı fırlatıyoruz!
    const response = await apiService.get('projects/');
    return response; 
  },

  /**
   * 2. Yeni proje oluştur (POST /projects/)
   */
  createProject: async (projectData) => {
    const response = await apiService.post('projects/', projectData);
    return response;
  },

  /**
   * 3. Proje detayını getir (GET /projects/{id}/)
   */
  getProjectById: async (id) => {
    const response = await apiService.get(`projects/${id}/`);
    return response;
  },

  /**
   * 4. Projeyi güncelle (PATCH /projects/{id}/)
   */
  updateProject: async (id, projectData) => {
    const response = await apiService.patch(`projects/${id}/`, projectData);
    return response;
  },

  /**
   * 5. Projeyi sil (DELETE /projects/{id}/)
   */
  deleteProject: async (id) => {
    const response = await apiService.delete(`projects/${id}/`);
    return response;
  },

  /**
   * ================= MEMBERS ENDPOINTS =================
   */

  getProjectMembers: async (projectId) => {
    const response = await apiService.get(`projects/${projectId}/members/`);
    return response;
  },

  addProjectMember: async (projectId, memberData) => {
    const response = await apiService.post(`projects/${projectId}/members/`, memberData);
    return response;
  },

  updateProjectMember: async (projectId, membershipId, memberData) => {
    const response = await apiService.patch(`projects/${projectId}/members/${membershipId}/`, memberData);
    return response;
  },

  removeProjectMember: async (projectId, membershipId) => {
    const response = await apiService.delete(`projects/${projectId}/members/${membershipId}/`);
    return response;
  },

  /**
   * ================= TAXONOMY ENDPOINTS =================
   */

  /**
   * Projenin etiket şemasını/sınıflarını getirir (GET /projects/{projectId}/taxonomy/)
   */
  getProjectTaxonomy: async (projectId) => {
    if (IS_TAXONOMY_MOCK) {
      // Backend 404 hatası verdiği için veriyi geçici olarak localStorage'dan simüle ediyoruz
      const localData = localStorage.getItem(`mock_taxonomy_${projectId}`);
      if (localData) {
        return JSON.parse(localData);
      }
      // Eğer proje için ilk defa taxonomy açılıyorsa varsayılan boş şema yapısını dönüyoruz
      return { classes: [], predicates: [], attributes: [] };
    }

    // Gerçek backend endpoint'i aktif olduğunda çalışacak kısım:
    const response = await apiService.get(`projects/${projectId}/taxonomy/`);
    return response;
  },

  /**
   * Projenin etiket şemasını günceller/üzerine yazar (PUT /projects/{projectId}/taxonomy/)
   */
  updateProjectTaxonomy: async (projectId, taxonomyData) => {
    if (IS_TAXONOMY_MOCK) {
      // Backend'e giden isteği simüle edip verileri tarayıcı hafızasına yazıyoruz
      localStorage.setItem(`mock_taxonomy_${projectId}`, JSON.stringify(taxonomyData));
      return { success: true, message: "Taxonomy saved locally." };
    }

    // Gerçek backend endpoint'i aktif olduğunda çalışacak kısım:
    const response = await apiService.put(`projects/${projectId}/taxonomy/`, taxonomyData);
    return response;
  }
};

export default projectService;