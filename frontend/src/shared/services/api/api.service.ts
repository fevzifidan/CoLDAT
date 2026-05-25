// src/shared/services/api.service.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import notificationService from '@/shared/services/notification';
import i18n from "@/i18n";

// Silent mod desteği için AxiosRequestConfig'i genişletiyoruz
declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

type NavigateFunction = (path: string) => void;
let navigateFn: NavigateFunction | null = null;

// 1. Axios Instance Oluşturma
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// 2. Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const errorMessage = backendMessage || i18n.t("apiService:error.unexpected_err");
    const isSilent = error.config?.silent === true;

    if (!isSilent) {
      switch (status) {
        case 401:
          localStorage.removeItem('access_token');
          notificationService.error(backendMessage || i18n.t("apiService:error.unauthorized"));
          if (navigateFn) navigateFn('/login');
          break;

        case 403:
          notificationService.warning(backendMessage || i18n.t("apiService:error.forbidden"));
          break;

        case 404:
          notificationService.info(backendMessage || i18n.t("apiService:error.not_found"));
          break;

        case 500:
          notificationService.error(backendMessage || i18n.t("apiService:error.internal_server"));
          break;

        default:
          if (error.code === 'ERR_NETWORK') {
            notificationService.error(i18n.t("apiService:error.network"));
          } else {
            notificationService.error(errorMessage);
          }
      }
    }

    return Promise.reject(error);
  }
);

// 4. Metotları Dışarı Açma
export const apiService = {
  get: <T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> =>
    apiClient.get(url, config),

  post: <T = any>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> =>
    apiClient.post(url, data, config),

  put: <T = any>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> =>
    apiClient.put(url, data, config),

  delete: <T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> =>
    apiClient.delete(url, config),

  patch: <T = any>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> =>
    apiClient.patch(url, data, config),

  client: apiClient,

  setNavigate: (fn: NavigateFunction) => {
    navigateFn = fn;
  }
};

export default apiService;