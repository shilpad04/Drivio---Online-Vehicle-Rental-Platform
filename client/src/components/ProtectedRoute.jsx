import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // Not logged in → redirect to home (login modal will handle auth)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Logged in but role not allowed
  if (!allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard
    if (user.role === "OWNER") return <Navigate to="/dashboard/owner" replace />;
    if (user.role === "ADMIN") return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "RENTER") return <Navigate to="/" replace />;
  }

  return children;
}
