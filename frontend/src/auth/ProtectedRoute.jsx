import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
}
