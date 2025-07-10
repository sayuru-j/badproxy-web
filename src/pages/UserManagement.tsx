import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { ErrorMessage, SuccessMessage } from "../components/ErrorMessage";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  is_admin: boolean;
}

interface EditingUser extends User {
  password?: string;
}

export const UserManagement = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "admin"
  >("all");
  const [showFilters, setShowFilters] = useState(false);

  // Create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    full_name: "",
    is_admin: false,
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Edit user modal
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createUser = async () => {
    if (
      !createFormData.username ||
      !createFormData.email ||
      !createFormData.password ||
      !createFormData.full_name
    ) {
      setError("All fields are required");
      return;
    }

    setCreatingUser(true);
    setError(null);

    try {
      await apiService.register(createFormData);
      setSuccess(`User "${createFormData.username}" created successfully`);
      setShowCreateModal(false);
      setCreateFormData({
        username: "",
        email: "",
        password: "",
        full_name: "",
        is_admin: false,
      });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    setUpdatingUser(true);
    setError(null);

    try {
      const updateData: any = {
        username: editingUser.username,
        email: editingUser.email,
        full_name: editingUser.full_name,
        is_admin: editingUser.is_admin,
      };

      if (editingUser.password) {
        updateData.password = editingUser.password;
      }

      await apiService.updateUser(editingUser.id, updateData);
      setSuccess(`User "${editingUser.username}" updated successfully`);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setUpdatingUser(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      setError("You cannot disable your own account");
      return;
    }

    try {
      await apiService.toggleUserStatus(user.id);
      setSuccess(
        `User "${user.username}" ${
          user.is_active ? "disabled" : "enabled"
        } successfully`
      );
      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle user status"
      );
    }
  };

  const deleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      setError("You cannot delete your own account");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await apiService.deleteUser(user.id);
      setSuccess(`User "${user.username}" deleted successfully`);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser?.is_admin) {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser, fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active) ||
      (filterStatus === "admin" && user.is_admin);

    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          User Management
        </h1>
        <ErrorMessage
          message="Authentication required to access user management"
          variant="error"
        />
      </div>
    );
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          User Management
        </h1>
        <ErrorMessage message="Administrator access required" variant="error" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            User Management
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Create User</span>
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

      {/* Users Management */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Users</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-400">
              {users.length} total
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>
                    Filter:{" "}
                    {filterStatus === "all"
                      ? "All Users"
                      : filterStatus === "active"
                      ? "Active"
                      : filterStatus === "inactive"
                      ? "Inactive"
                      : "Admins"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFilters && (
                <div className="mt-2 space-y-1 bg-gray-800 border border-gray-700 rounded p-2">
                  {[
                    { value: "all", label: "All Users" },
                    { value: "active", label: "Active Users" },
                    { value: "inactive", label: "Inactive Users" },
                    { value: "admin", label: "Administrators" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatus(option.value as typeof filterStatus);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filterStatus === option.value
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Filter */}
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
              className="hidden sm:block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Users List */}
          {loading ? (
            <Loading message="Loading users..." size="sm" />
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3 sm:p-4 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">
                            {user.full_name}
                          </h4>
                          <p className="text-gray-400 text-xs truncate">
                            @{user.username}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {user.is_admin && (
                          <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded">
                            Admin
                          </span>
                        )}
                        <div
                          className={`px-2 py-1 text-xs rounded ${
                            user.is_active
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white ml-1">#{user.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white ml-1">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">Last Login:</span>
                        <span className="text-white ml-1">
                          {user.last_login
                            ? new Date(user.last_login).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2 border-t border-gray-700">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {user.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1 rounded transition-colors text-xs ${
                              user.is_active
                                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {user.is_active ? (
                              <UserX className="w-3 h-3" />
                            ) : (
                              <UserCheck className="w-3 h-3" />
                            )}
                            <span>{user.is_active ? "Disable" : "Enable"}</span>
                          </button>

                          <button
                            onClick={() => deleteUser(user)}
                            className="flex items-center justify-center px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || user.username[0].toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium truncate">
                            {user.full_name}
                          </h4>
                          {user.is_admin && (
                            <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          )}
                          <div
                            className={`px-2 py-1 text-xs rounded ${
                              user.is_active
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                          <span>@{user.username}</span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Edit user"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {user.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className={`p-2 rounded transition-colors ${
                              user.is_active
                                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                            title={
                              user.is_active ? "Disable user" : "Enable user"
                            }
                          >
                            {user.is_active ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => deleteUser(user)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    {searchTerm || filterStatus !== "all"
                      ? "No users match the current filter"
                      : "No users found"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Create New User
              </h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={createFormData.username}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={createFormData.full_name}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    value={createFormData.password}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showCreatePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={createFormData.is_admin}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      is_admin: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_admin" className="text-sm text-gray-300">
                  Administrator privileges
                </label>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-700 flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                disabled={creatingUser}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {creatingUser && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{creatingUser ? "Creating..." : "Create User"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Edit User: {editingUser.username}
              </h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password (leave empty to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editingUser.password || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {editingUser.id !== currentUser?.id && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_admin"
                    checked={editingUser.is_admin}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        is_admin: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="edit_is_admin"
                    className="text-sm text-gray-300"
                  >
                    Administrator privileges
                  </label>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-700 flex space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                disabled={updatingUser}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {updatingUser && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{updatingUser ? "Updating..." : "Update User"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
