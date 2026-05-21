// src/features/projects/services/projectService.js
import apiService from '@/shared/services/api/apiClient';

/**
 * MOCK VERİLER (Backend hazır olana kadar hem Projects hem de Tasks sayfasını besler)
 */
const MOCK_PROJECTS = [
  { 
    id: "p1", 
    name: "dsds", 
    description: "Sample workspace configuration", 
    project_type: "object_detection", 
    dataset_id: "1", 
    created_at: "2026-05-21T10:00:00Z", 
    status: "NEW", 
    role: "ADMIN",
    count: 0
  },
  { 
    id: "p2", 
    name: "Traffic Sign Detection", 
    description: "Object detection for urban road tracking", 
    project_type: "object_detection", 
    dataset_id: "1", 
    created_at: "2026-05-20T11:00:00Z", 
    status: "IN_PROGRESS", 
    role: "ANNOTATOR",
    count: 1250
  },
  { 
    id: "p3", 
    name: "Medical NLP Labeling", 
    description: "Entity recognition on patient clinical logs", 
    project_type: "entity_recognition", 
    dataset_id: "2", 
    created_at: "2026-05-19T14:30:00Z", 
    status: "COMPLETED", 
    role: "ANNOTATOR",
    count: 500
  },
  { 
    id: "p4", 
    name: "Autonomous Vehicle Relations", 
    description: "Semantic relation extractor for objects", 
    project_type: "semantic_relation", 
    dataset_id: "1", 
    created_at: "2026-05-18T09:15:00Z", 
    status: "NEW", 
    role: "VIEWER",
    count: 0
  }
];

export const projectService = {
  /**
   * 1. Tüm projeleri listele (GET /projects)
   */
  getAllProjects: async () => {
    try {
      const response = await apiService.get('/projects');
      // Eğer backend response.data katmanıyla dönüyorsa onu ver, yoksa direkt response döndür
      return response.data || response;
    } catch (error) {
      console.warn("Mocking: getAllProjects (Falling back to local data)");
      return MOCK_PROJECTS;
    }
  },

  /**
   * 2. Yeni proje oluştur (POST /projects)
   */
  createProject: async (projectData) => {
    try {
      const response = await apiService.post('/projects', projectData);
      return response.data || response;
    } catch (error) {
      console.warn("Mocking: createProject", projectData);
      return { 
        ...projectData, 
        id: "mock_proj_" + Date.now(), 
        created_at: new Date().toISOString(),
        status: "NEW",
        role: "ADMIN",
        count: 0
      };
    }
  },

  /**
   * 3. Proje detayını getir (GET /projects/{id})
   */
  getProjectById: async (id) => {
    try {
      const response = await apiService.get(`/projects/${id}`);
      return response.data || response;
    } catch (error) {
      console.warn("Mocking: getProjectById", id);
      const found = MOCK_PROJECTS.find(p => p.id === id);
      return found || {
        id: id,
        name: "Simulated Project Detail Workspace",
        description: "Fallback system generated project layout.",
        project_type: "object_detection",
        dataset_id: "1",
        created_at: new Date().toISOString(),
        status: "IN_PROGRESS",
        role: "ADMIN",
        count: 100
      };
    }
  },

  /**
   * 4. Projeyi sil (DELETE /projects/{id})
   */
  deleteProject: async (id) => {
    try {
      const response = await apiService.delete(`/projects/${id}`);
      return response.data || response;
    } catch (error) {
      console.warn("Mocking: deleteProject", id);
      return { success: true, id };
    }
  }
};