import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import CvList from "./pages/cvs/CvList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import CvPrint from "./pages/cvs/CvPrint";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import CvFull from "./pages/cvs/CvFull";
export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/cvs/:id/print" element={<CvPrint />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cvs" element={<CvList />} />
              <Route path="/cvs/:id/full" element={<CvFull />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={<div className="container">Not found</div>}
          />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
}
