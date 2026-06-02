// src/shared/services/api/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İsteklere otomatik token ekleyen interceptor (Fonksiyonel ve Güvenli Hali)
apiClient.interceptors.request.use(
  (config) => {
    // 1. Her istek atıldığı ANDA güncel token'ı yerinden çekiyoruz
    const token = localStorage.getItem('access_token');
    
    // 2. Axios'un güvenli set metodunu kullanarak başlığı ekliyoruz
    if (token && config.headers) {
      // Django REST Framework (SimpleJWT) standardı: "Bearer <token>"
      config.headers.set('Authorization', `Bearer ${token.trim()}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;