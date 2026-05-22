// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import apiService from "@/shared/services/api";
import { Logger } from '@/shared/services/logging/logging';

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
            Logger.warn("Stored token validation failed", {
              status: error.response?.status,
              traceId: Logger.getTraceId(),
            });
            setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 2. Login Fonksiyonu
  const login = async (credentials, config = {}) => {
    Logger.info("Login attempt", { traceId: Logger.getTraceId() });
    try {
    const response = await apiService.post("/auth/login", credentials, config);
    localStorage.setItem("token", response.token);
    setUser(response.user);
      Logger.info("Login successful", { userId: response.user?.id, traceId: Logger.getTraceId() });
    return response;
    } catch (error) {
      Logger.info("Login failed", {
        errorCode: error.response?.data?.errorCode,
        status: error.response?.status,
        traceId: Logger.getTraceId(),
      });
      throw error;
    }
  };

  // 3. Logout Fonksiyonu
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    Logger.info("Logout", { traceId: Logger.getTraceId() });
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