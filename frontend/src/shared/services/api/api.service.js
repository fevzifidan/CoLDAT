// src/shared/services/api.service.js
import axios from 'axios';
import notificationService from '@/shared/services/notification';
import i18n from "@/i18n";

let navigateFn = null;

// 1. Axios Instance Oluşturma
// Base URL'i environment variable'dan alınır.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 seconds timeout
});

// 2. Request Interceptor (İstek atılmadan hemen önce)
apiClient.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token çekip header'a ekleme işlemi burada yapılır
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Cevap döndükten hemen sonra)
apiClient.interceptors.response.use(
  (response) => {
    // Başarılı durumda direkt response.data'yı döndür. Bu sayede servisten
    // faydalanan kodlar, direkt olarak backend verisiyle çalışabilir.
    return response.data;
  },
  (error) => {
    // Hata Yönetimi
    const status = error.response?.status;

    // a) Backend'den gelen özel hata mesajını yakalayalım
    // Genelde backend { message: "Hata detayı" } döner.
    const backendMessage = error.response?.data?.message;
    const errorMessage = backendMessage || i18n.t("apiService:error.unexpected_err");

    // b) "Silent" (Sessiz) Mod Kontrolü
    // İstek atarken config içine { silent: true } eklenirse silent mode seçilmiş olur.
    // Silent modda merkezi bildirim gösterilmez.
    const isSilent = error.config?.silent === true;

    if (!isSilent) {
        switch (status) {
            case 401:
                // Unauthorized
                localStorage.removeItem('token');
                notificationService.error(backendMessage || i18n.t("apiService:error.unauthorized"));
                if (navigateFn) navigateFn('/login');
                break;

            case 403:
                // Forbidden
                notificationService.warning(backendMessage || i18n.t("apiService:error.forbidden"));
                break;

            case 404:
                // Not Found
                notificationService.info(backendMessage || i18n.t("apiService:error.not_found"));
                break;

            case 500:
                // Internal Server Error
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
// Doğrudan axios instance'ı yerine bu wrapper objeyi kullanmak daha güvenlidir.
export const apiService = {
  get: (url, config = {}) => apiClient.get(url, config),
  
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  
  delete: (url, config = {}) => apiClient.delete(url, config),

  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  
  // Axios instance'ına doğrudan erişim gerekirse (örn: interceptor eject için)
  client: apiClient,

  // React tarafından navigate fonksiyonunu buraya göndermek için
  setNavigate: (fn) => {
    navigateFn = fn;
  }
};

export default apiService;