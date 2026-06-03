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

// Token yenileme state'i — aynı anda birden fazla yenileme isteğini engeller
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    // Doğrudan axios.post kullanıyoruz (interceptor tetiklenmesin diye değil, apiService henüz tanımlı değil)
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh/`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const newToken = response.data?.access_token || response.data?.access;
    if (newToken) {
      localStorage.setItem('access_token', newToken);
      return newToken;
    }
    return null;
  } catch (err) {
    // Refresh başarısız — tüm tokenları temizle
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
}

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

    // Accept-Language Header
    if (config.headers) {
      config.headers['Accept-Language'] = i18n.language?.substring(0, 2) || 'en';
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
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const errorMessage = backendMessage || i18n.t("apiService:error.unexpected_err");
    const isSilent = error.config?.silent === true;

    // 401 + "token not valid" durumunda token yenileme dene
    const isTokenInvalid =
      status === 401 &&
      backendMessage &&
      backendMessage.toLowerCase().includes("given token not valid for any token type".toLowerCase()) &&
      !originalRequest._retry;

    if (isTokenInvalid) {
      // Zaten yenileme yapılıyorsa kuyruğa ekle
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
          return Promise.reject(error);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Bekleyen tüm istekleri yeni token'la devam ettir
          processQueue(null, newToken);
          // Mevcut isteği yeni token'la yeniden dene
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          // Refresh başarısız — tüm kuyruğu reddet ve login'e yönlendir
          processQueue(error, null);
          notificationService.error(i18n.t("apiService:error.session_expired", "Oturum süreniz doldu. Lütfen tekrar giriş yapın."));
          if (navigateFn) navigateFn('/login');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        notificationService.error(i18n.t("apiService:error.session_expired", "Oturum süreniz doldu. Lütfen tekrar giriş yapın."));
        if (navigateFn) navigateFn('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Diğer 401 durumları (geçersiz kimlik bilgileri vb.) — normal akış
    if (!isSilent) {
      switch (status) {
        case 401:
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
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