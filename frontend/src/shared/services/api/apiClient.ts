// FEVZİ'NİN UYARISI: Mükerrer interceptor ezildi. Dosya silinmeden ana servise köprü yapıldı.
// Fix: correct relative path to api.service in the same folder
import apiService from './api.service';

export const apiClient = apiService.client;

export default apiClient;