// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import apiService from "@/shared/services/api/apiClient";

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
          // Port karmaşasını önlemek için doğrudan Django adresine (8000) tam URL ile istek atıyoruz
          const response = await apiService.get("http://localhost:8000/account/me/", {
            headers: { Authorization: `Bearer ${token}` }
          }); 
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
  const login = async (credentials, config = {}) => {
    // KRİTİK DÜZELTME: İsteğin 5174'e gitmesini engellemek için doğrudan Django portunu (8000) açıkça yazıyoruz!
    const response = await apiService.post("http://localhost:8000/auth/login/", credentials, config);
    
    console.log("Backend'den gelen yanıt:", response);

    const dataInside = response?.data || response;
    
    // Django / SimpleJWT yapılarına göre token ayıklama
    const token = dataInside?.access || dataInside?.token || dataInside?.access_token || response?.data?.access;
    const userData = dataInside?.user || dataInside;

    if (token) {
      console.log("Token başarıyla alındı ve hafızaya kaydediliyor.");
      localStorage.setItem("access_token", token);
      setUser(userData);
    } else {
      console.error("Giriş başarılı ancak response içerisinden token okunamadı!", dataInside);
    }
    
    return response;
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