import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ adminOnly = false, staffAllowed = false }) {
  const { user, loading, isAdmin, isStaffOrAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin && !(staffAllowed && isStaffOrAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
