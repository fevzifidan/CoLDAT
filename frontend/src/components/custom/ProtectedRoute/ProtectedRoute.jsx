// src/components/custom/ProtectedRoute/ProtectedRoute.js

import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    // Keep the page the user came from in memory when redirecting them to login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}