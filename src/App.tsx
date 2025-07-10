import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { VMess } from "./pages/VMess";
import { System } from "./pages/System";
import { Config } from "./pages/Config";
import { useAuth } from "./contexts/AuthContext";
import { AuthStatusDashboard } from "./components/AuthStatusDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserManagement } from "./pages/UserManagement";
import { ChangePassword } from "./pages/ChangePassword";
import { AccountSettings } from "./pages/AccountSettings";
import { ThemeProvider } from "./contexts/ThemeContext";

// Mobile Loading Component
const MobileLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center px-4">
    <div className="text-center max-w-sm w-full">
      {/* Responsive Loading Spinner */}
      <div className="relative mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div
          className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-2 border-purple-500 border-b-transparent rounded-full animate-spin mx-auto mt-2 sm:mt-2"
          style={{ animationDirection: "reverse", animationDuration: "0.75s" }}
        ></div>
      </div>

      {/* Responsive Text */}
      <div className="space-y-2">
        <p className="text-gray-200 text-base sm:text-lg font-medium">
          BadProxy Admin
        </p>
        <p className="text-gray-400 text-sm sm:text-base">
          Loading your dashboard...
        </p>

        {/* Mobile-friendly progress indicator */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 sm:h-2 mt-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>

        {/* Loading tips for mobile */}
        <div className="mt-6 p-3 sm:p-4 bg-gray-900 border border-gray-700 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-400">
            💡 <span className="text-gray-300">Tip:</span> Swipe right from the
            edge to access the sidebar on mobile
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Error Boundary Component for Mobile
const MobileErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen bg-black">{children}</div>;
};

// Auth-aware router component with mobile optimizations
const AppRoutes = () => {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Enhanced loading screen for mobile
  if (isLoading) {
    return <MobileLoader />;
  }

  // Enhanced error state for mobile
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 sm:p-6 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl sm:text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Connection Error
            </h2>
            <p className="text-red-400 text-sm sm:text-base mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Retry Connection
            </button>
          </div>
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

      {/* Protected Routes with Mobile Layout */}
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

        {/* User Management - Admin only */}
        <Route
          path="user-management"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Change Password */}
        <Route path="change-password" element={<ChangePassword />} />

        {/* Account Settings */}
        <Route path="account-settings" element={<AccountSettings />} />
      </Route>

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center max-w-sm w-full">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Page Not Found
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() =>
                    (window.location.href = isAuthenticated ? "/" : "/login")
                  }
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
                </button>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Mobile App Wrapper with enhanced features
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MobileErrorBoundary>
            {/* Mobile-optimized app container */}
            <div className="min-h-screen bg-black text-white antialiased">
              {/* Mobile viewport meta optimization */}
              <div className="min-h-screen flex flex-col">
                {/* Mobile-safe routing */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <AppRoutes />
                </div>

                {/* Mobile-specific footer - Hidden by default, can be enabled */}
                <div className="sm:hidden">
                  {/* Optional mobile footer for additional navigation */}
                  {/* Uncomment if you want a mobile bottom navigation */}
                  {/*
                <div className="bg-gray-900 border-t border-gray-700 px-4 py-2">
                  <div className="flex justify-center items-center space-x-4">
                    <div className="text-xs text-gray-400 text-center">
                      <span>BadProxy Admin v1.0.0</span>
                    </div>
                  </div>
                </div>
                */}
                </div>
              </div>
            </div>
          </MobileErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
