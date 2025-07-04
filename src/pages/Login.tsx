import { useState, useEffect } from "react";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Login = () => {
  const {
    isAuthenticated,
    login,
    isLoading,
    error: authError,
    isConnected,
    health,
  } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Clear errors when form data changes
  useEffect(() => {
    if (loginError) {
      setLoginError(null);
    }
  }, [formData.username, formData.password]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-gray-900 p-6 rounded-full mx-auto mb-6 w-fit">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Already Authenticated
          </h2>
          <p className="text-gray-400 mb-6">
            You are already logged in to BadProxy Admin
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: any) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!formData.username || !formData.password) {
      setLoginError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    const success = await login(formData.username, formData.password);

    if (!success) {
      setLoginError("Invalid username or password. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Initializing BadProxy Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gray-900 p-3 rounded-full border border-gray-700">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">BadProxy Admin</h2>
          <p className="mt-2 text-gray-400">
            Sign in to manage your VMess configurations
          </p>

          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm">API Connected</span>
                {health && (
                  <span className="text-gray-500 text-xs">
                    v{health.version}
                  </span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-sm">API Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(authError || loginError) && (
          <div className="border border-red-600 bg-red-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm">
                  {loginError || authError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Connection Warning */}
        {!isConnected && (
          <div className="border border-yellow-600 bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 text-sm">
                  Unable to connect to BadProxy API. Please check if the server
                  is running.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as any)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as any)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.username ||
              !formData.password ||
              !isConnected
            }
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            BadProxy API v{health?.version || "1.0.0"} - VMess Management System
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Secure Authentication</span>
            <span>•</span>
            <span>JWT Tokens</span>
            <span>•</span>
            <span>API Keys Supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};
