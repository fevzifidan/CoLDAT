import { createContext, useContext, useState, useEffect } from "react";
// FEVZİ'NİN UYARISI & KLASÖR DÜZELTMESİ: Doğru merkezi servise bağlandık
import apiService from "@/shared/services/api/api.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Uygulama ilk açıldığında token kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      
      if (token) {
        try {
          // FEVZİ'NİN UYARISI: Hardcoded localhost kaldırıldı. apiService zaten baseUrl'e sahip.
          const response = await apiService.get("/account/me/"); 
          const responseData = response?.data || response;
          setUser(responseData);
        } catch (error) {
          console.error("Token geçersiz, temizleniyor...");
          localStorage.removeItem("access_token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

// 2. Login Fonksiyonu
// 2. Login Fonksiyonu
  const login = async (credentials, config = {}) => {
    try {
      // Ekranda kullanıcı ne yazdıysa (ister email kutusu, ister username) 
      // onu alıp backend'in ZORUNLU istediği 'email' anahtarına koyuyoruz.
      const djangoPayload = {
        email: credentials.email || credentials.username || credentials.identifier,
        password: credentials.password
      };

      console.log("Çalışan URL'e giden paket:", djangoPayload);

      // Çalışan tam backend URL'iniz (http://localhost:8000/auth/login/)
      const response = await apiService.post("/auth/login/", djangoPayload, config);
      
      console.log("Backend'den gelen yanıt:", response);

      const token = response?.access || response?.token || response?.access_token || response?.data?.access;
      const userData = response?.user || response;

      if (token) {
        localStorage.setItem("access_token", token);
        setUser(userData);
      }
      
      return response;
    } catch (error) {
      console.error("Giriş hatası:", error.response?.data || error);
      throw error;
    }
  };

  // 3. Logout Fonksiyonu
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  }
  return context;
};