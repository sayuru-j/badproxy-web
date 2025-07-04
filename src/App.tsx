import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { VMess } from "./pages/VMess";
import { System } from "./pages/System";
import { Config } from "./pages/Config";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectredRoute";
import { AuthStatusDashboard } from "./components/AuthStatusDashboard";

// Auth-aware router component
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading BadProxy Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Default route */}
        <Route index element={<Dashboard />} />

        {/* VMess Management */}
        <Route path="vmess" element={<VMess />} />

        {/* System Management - Admin only */}
        <Route
          path="system"
          element={
            <ProtectedRoute adminOnly>
              <System />
            </ProtectedRoute>
          }
        />

        {/* Configuration Management */}
        <Route path="config" element={<Config />} />

        {/* Authentication Status Dashboard */}
        <Route path="auth-status" element={<AuthStatusDashboard />} />
      </Route>

      {/* Catch-all route - redirect to dashboard if authenticated, login if not */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-black text-white">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
