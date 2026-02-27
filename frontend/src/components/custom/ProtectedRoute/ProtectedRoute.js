import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Keep the page the user came from in memory when redirecting them to login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}