import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "OWNER") return <Navigate to="/dashboard/owner" replace />;
    if (user.role === "ADMIN") return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "RENTER") return <Navigate to="/" replace />;
  }

  return children;
}
