// src/features/synthetic/services/syntheticService.ts
import apiService from '@/shared/services/api/apiClient';

// Sayfadaki hataları çözecek kritik tip tanımı (Interface)
export interface SyntheticTask {
  id: string;
  name: string;
  type: string;
  output_dataset: string;
  status: 'Completed' | 'Running' | 'Failed';
  progress: number;
  created_at: string;
}

const MOCK_SYNTHETIC_TASKS: SyntheticTask[] = [
  {
    id: "syn_1",
    name: "Rainy Weather Augmentation",
    type: "Image",
    output_dataset: "Autonomous Driving",
    status: "Running",
    progress: 45,
    created_at: "2026-05-21T14:00:00Z"
  },
  {
    id: "syn_2",
    name: "Medical Text Generation",
    type: "Text",
    output_dataset: "Clinical NLP Logs",
    status: "Completed",
    progress: 100,
    created_at: "2026-05-20T10:30:00Z"
  },
  {
    id: "syn_3",
    name: "Night Scene Simulation",
    type: "Image",
    output_dataset: "City Traffic Cameras",
    status: "Failed",
    progress: 12,
    created_at: "2026-05-19T16:45:00Z"
  }
];

export const syntheticService = {
  getTasks: async (): Promise<SyntheticTask[]> => {
    try {
      const res = await apiService.get('/synthetic-tasks');
      return res.data || res;
    } catch (error) {
      console.warn("Mocking: getTasks falling back to design template");
      return MOCK_SYNTHETIC_TASKS;
    }
  },

  createTask: async (taskData: { name: string; type: string; datasetId: string; prompt: string; count: string }): Promise<SyntheticTask> => {
    try {
      const res = await apiService.post('/synthetic-tasks', taskData);
      return res.data || res;
    } catch (error) {
      console.warn("Mocking: createTask", taskData);
      return {
        id: "syn_" + Date.now(),
        name: taskData.name || "Untitled Pipeline",
        type: taskData.type || "Image",
        output_dataset: taskData.datasetId === "1" ? "Autonomous Driving" : "Clinical NLP Logs",
        status: "Running",
        progress: 0,
        created_at: new Date().toISOString()
      };
    }
  }
};