import axios from 'axios';

// YAML dökümanındaki base URL: http://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// projectService'in apiService adıyla default import edebilmesi için ekledik:
export default apiClient;