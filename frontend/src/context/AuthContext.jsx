// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import apiService from "@/shared/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Uygulama ilk açıldığında token'ı kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
            const userData = await apiService.get("/account/me"); 
            setUser(userData);
                } catch (error) {
            // Token is not valid
            setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 2. Login Fonksiyonu
  const login = async (credentials, config = {}) => {
    try {
    const response = await apiService.post("/auth/login", credentials, config);
    localStorage.setItem("token", response.token);
    setUser(response.user);
    return response;
    } catch (error) {
      throw error;
    }
  };

  // 3. Logout Fonksiyonu
  const logout = () => {
    localStorage.removeItem("token");
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