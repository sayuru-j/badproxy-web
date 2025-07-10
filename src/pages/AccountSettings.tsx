import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  Save,
  ArrowLeft,
  Eye,
  Copy,
  Settings as SettingsIcon,
  Bell,
  Smartphone,
  Globe,
  Clock,
} from "lucide-react";
import { Card } from "../components/Card";
import { ErrorMessage, SuccessMessage } from "../components/ErrorMessage";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { copyToClipboard } from "../utils";
import { LabeledThemeToggle } from "../components/ThemeToggle";

interface ApiKeyInfo {
  key_name: string;
  api_key: string;
  created_at: string;
}

export const AccountSettings = () => {
  const { user, isAuthenticated, refreshUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    full_name: user?.full_name || "",
  });

  // API Key management
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<ApiKeyInfo | null>(
    null
  );
  const [keyName, setKeyName] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await apiService.updateUser(user.id, editForm);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      await refreshUserInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: user?.username || "",
      email: user?.email || "",
      full_name: user?.full_name || "",
    });
    setIsEditing(false);
    setError(null);
  };

  const generateApiKey = async () => {
    if (!keyName.trim()) {
      setError("Please enter a name for the API key");
      return;
    }

    setGeneratingKey(true);
    setError(null);

    try {
      const result = await apiService.generateApiKey(keyName.trim());
      setGeneratedApiKey({
        key_name: result.key_name,
        api_key: result.api_key,
        created_at: new Date().toISOString(),
      });
      setSuccess("API key generated successfully");
      setKeyName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate API key"
      );
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyApiKey = () => {
    if (generatedApiKey) {
      copyToClipboard(generatedApiKey.api_key);
      setSuccess("API key copied to clipboard");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Account Settings
        </h1>
        <ErrorMessage
          message="Authentication required to access account settings"
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
            Account Settings
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage your account information and preferences
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

      <div className="max-w-4xl space-y-6">
        {/* Profile Information */}
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  Profile Information
                </span>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Edit
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || user?.username[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg sm:text-xl">
                  {user?.full_name}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  @{user?.username}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {user?.is_admin && (
                    <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Administrator</span>
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user?.is_active
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {user?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm">
                    {user?.username}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm">
                    {user?.email}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm">
                    {user?.full_name}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Account Information</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-400">Account Created</p>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {user?.last_login
                  ? new Date(user.last_login).toLocaleDateString()
                  : "Never"}
              </p>
              <p className="text-sm text-gray-400">Last Login</p>
            </div>

            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">#{user?.id}</p>
              <p className="text-sm text-gray-400">User ID</p>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Security Settings</span>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Change Password */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-yellow-500" />
                <div>
                  <h4 className="text-white font-medium text-sm sm:text-base">
                    Password
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Change your account password
                  </p>
                </div>
              </div>
              <button
                onClick={() => (window.location.href = "/change-password")}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Change
              </button>
            </div>

            {/* Two-Factor Authentication (Placeholder) */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-white font-medium text-sm sm:text-base">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Add an extra layer of security (Coming Soon)
                  </p>
                </div>
              </div>
              <button
                disabled
                className="px-3 py-1 bg-gray-600 text-gray-400 rounded cursor-not-allowed text-sm"
              >
                Setup
              </button>
            </div>

            {/* Login Sessions (Placeholder) */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-white font-medium text-sm sm:text-base">
                    Active Sessions
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Manage your active login sessions (Coming Soon)
                  </p>
                </div>
              </div>
              <button
                disabled
                className="px-3 py-1 bg-gray-600 text-gray-400 rounded cursor-not-allowed text-sm"
              >
                Manage
              </button>
            </div>
          </div>
        </Card>

        {/* API Key Management - Admin Only */}
        {user?.is_admin && (
          <Card
            title={
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">API Key Management</span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
                <p className="text-blue-400 text-xs sm:text-sm">
                  🔑 API keys allow you to authenticate with the BadProxy API
                  without using your username and password. Keep your API keys
                  secure and don't share them.
                </p>
              </div>

              {/* Generate New API Key */}
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm sm:text-base">
                  Generate New API Key
                </h4>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    placeholder="Enter a name for this API key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                  <button
                    onClick={generateApiKey}
                    disabled={generatingKey || !keyName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm flex items-center space-x-2"
                  >
                    {generatingKey && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <Key className="w-4 h-4" />
                    <span>{generatingKey ? "Generating..." : "Generate"}</span>
                  </button>
                </div>
              </div>

              {/* Generated API Key Display */}
              {generatedApiKey && (
                <div className="space-y-3 p-4 bg-green-900/20 border border-green-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h5 className="text-green-400 font-medium text-sm">
                      API Key Generated Successfully
                    </h5>
                    <span className="text-xs text-green-400">
                      {new Date(generatedApiKey.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-green-400 mb-1">
                      Key Name:
                    </label>
                    <p className="text-white text-sm font-mono">
                      {generatedApiKey.key_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-green-400 mb-1">
                      API Key:
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-2 bg-black border border-green-600 rounded font-mono text-xs break-all">
                        {showApiKey ? (
                          <span className="text-green-400">
                            {generatedApiKey.api_key}
                          </span>
                        ) : (
                          <span className="text-green-400">
                            {generatedApiKey.api_key.substring(0, 8)}
                            {"•".repeat(32)}
                            {generatedApiKey.api_key.substring(-8)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title={showApiKey ? "Hide API key" : "Show API key"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={copyApiKey}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Copy API key"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 bg-yellow-900/20 border border-yellow-600 rounded">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ <strong>Important:</strong> This is the only time
                      you'll see this API key. Store it securely and don't share
                      it with anyone.
                    </p>
                  </div>

                  <div className="text-xs text-gray-400">
                    <p>
                      <strong>Usage:</strong> Include this key in your API
                      requests using the header:
                    </p>
                    <code className="text-green-400">
                      X-API-Key: {generatedApiKey.api_key}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Preferences */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Preferences</span>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Theme Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium text-sm sm:text-base">
                  Theme
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Choose your preferred theme
                </p>
              </div>
              <LabeledThemeToggle />
            </div>

            {/* Email Notifications (Placeholder) */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-50">
              <div>
                <h4 className="text-white font-medium text-sm sm:text-base">
                  Email Notifications
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Receive notifications about your account (Coming Soon)
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-50">
              <div>
                <h4 className="text-white font-medium text-sm sm:text-base">
                  Language
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Choose your preferred language (Coming Soon)
                </p>
              </div>
              <select
                disabled
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-gray-400 text-sm disabled:opacity-50"
              >
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
