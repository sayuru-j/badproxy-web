import { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  Shield,
  Check,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Card } from "../components/Card";
import { ErrorMessage, SuccessMessage } from "../components/ErrorMessage";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

export const ChangePassword = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push("Use at least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Include lowercase letters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Include uppercase letters");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Include numbers");
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Include special characters");
    }

    let label = "Very Weak";
    let color = "text-red-500";

    if (score >= 5) {
      label = "Very Strong";
      color = "text-green-500";
    } else if (score >= 4) {
      label = "Strong";
      color = "text-green-400";
    } else if (score >= 3) {
      label = "Good";
      color = "text-yellow-500";
    } else if (score >= 2) {
      label = "Fair";
      color = "text-orange-500";
    } else if (score >= 1) {
      label = "Weak";
      color = "text-red-400";
    }

    return { score, label, color, suggestions };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!formData.newPassword) {
      setError("New password is required");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      setSuccess("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PasswordForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Change Password
        </h1>
        <ErrorMessage
          message="Authentication required to change password"
          variant="error"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Change Password
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Update your account password for security
          </p>
        </div>

        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          variant="error"
        />
      )}

      {success && (
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      )}

      <div className="max-w-2xl">
        {/* User Info */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Account Security</span>
            </div>
          }
          className="mb-6"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">
                  {user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || user?.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm sm:text-base">
                  {user?.full_name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  @{user?.username}
                </p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
              <p className="text-blue-400 text-xs sm:text-sm">
                💡 For security, please use a strong password with at least 8
                characters, including uppercase, lowercase, numbers, and special
                characters.
              </p>
            </div>
          </div>
        </Card>

        {/* Change Password Form */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Change Password</span>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    handleChange("currentPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:py-3 pr-10 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm sm:text-base"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 pr-10 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm sm:text-base"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-medium ${passwordStrength.color}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 5
                          ? "bg-green-500"
                          : passwordStrength.score >= 4
                          ? "bg-green-400"
                          : passwordStrength.score >= 3
                          ? "bg-yellow-500"
                          : passwordStrength.score >= 2
                          ? "bg-orange-500"
                          : passwordStrength.score >= 1
                          ? "bg-red-400"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>

                  {passwordStrength.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Suggestions:</p>
                      <ul className="space-y-1">
                        {passwordStrength.suggestions.map(
                          (suggestion, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-2 text-xs text-gray-500"
                            >
                              <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:py-3 pr-10 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm sm:text-base"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-500">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword ||
                  formData.newPassword !== formData.confirmPassword
                }
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <Key className="w-4 h-4" />
                <span>
                  {loading ? "Changing Password..." : "Change Password"}
                </span>
              </button>
            </div>
          </form>
        </Card>

        {/* Security Tips */}
        <Card title="Security Tips" className="mt-6">
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Use a unique password that you don't use for other accounts
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Include a mix of uppercase, lowercase, numbers, and special
                characters
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Make it at least 8 characters long, but longer is better
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Avoid using personal information like birthdays or names
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                Consider using a password manager to generate and store secure
                passwords
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
