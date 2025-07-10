import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  FileText,
  Activity,
  Menu,
  X,
  ChevronRight,
  Users,
  LogOut,
  Settings,
  Key,
  UserCog,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    shortLabel: "Home",
  },
  {
    to: "/vmess",
    label: "VMess",
    icon: Shield,
    shortLabel: "VMess",
  },
  {
    to: "/system",
    label: "System",
    icon: Activity,
    shortLabel: "System",
    adminOnly: true,
  },
  {
    to: "/config",
    label: "Config",
    icon: FileText,
    shortLabel: "Config",
    adminOnly: true,
  },
  {
    to: "/user-management",
    label: "Users",
    icon: Users,
    shortLabel: "Users",
    adminOnly: true,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const Sidebar = ({ onToggle, onClose }: SidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  const { user, logout, isConnected, health } = useAuth();
  const navigate = useNavigate();

  // Track current path for mobile breadcrumb
  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      handleMobileClose();
    };

    window.addEventListener("popstate", handleLocationChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const getCurrentPageInfo = () => {
    const currentItem =
      navItems.find(
        (item) =>
          item.to === currentPath ||
          (item.to !== "/" && currentPath.startsWith(item.to))
      ) || navItems[0];
    return currentItem;
  };

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onToggle) onToggle();
  };

  const handleMobileClose = () => {
    setIsMobileMenuOpen(false);
    if (onClose) onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileClose();
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex relative w-64 bg-gray-900 border-r border-gray-800 flex-col h-full">
        {/* Desktop Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">BadProxy</h1>
          <p className="text-gray-400 text-sm mt-1">VMess Management</p>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 py-4">
          {navItems
            .filter((item) => !item.adminOnly || user?.is_admin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white border-r-2 border-white"
                      : ""
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.adminOnly && (
                  <Shield className="w-3 h-3 ml-auto text-yellow-500" />
                )}
              </NavLink>
            ))}
        </nav>

        {/* Desktop Footer */}
        <div className="p-6 border-t border-gray-800 mt-auto">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Version 1.0.0</p>
            <p>© 2025 BadProxy</p>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Header - Only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 px-4 py-3 z-40">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button and current page */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMobileToggle}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              {(() => {
                const currentPage = getCurrentPageInfo();
                const IconComponent = currentPage.icon;
                return (
                  <>
                    <IconComponent className="w-5 h-5 text-white flex-shrink-0" />
                    <h1 className="text-lg font-semibold text-white truncate">
                      {currentPage.label}
                    </h1>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Right side - Connection status and user avatar */}
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}

            {/* User Avatar - opens mobile menu */}
            {user && (
              <button
                onClick={handleMobileToggle}
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">
                  {getInitials(user.full_name || user.username)}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">BadProxy</h1>
            <p className="text-gray-400 text-sm mt-1">VMess Management</p>
          </div>
          <button
            onClick={handleMobileClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors ml-3 flex-shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Section - Mobile */}
        {user && (
          <div className="p-4 border-b border-gray-800 bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {getInitials(user.full_name || user.username)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user.full_name}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  @{user.username}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      user.is_admin
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-blue-900 text-blue-300"
                    }`}
                  >
                    {user.is_admin ? "Admin" : "User"}
                  </span>
                  <div className="flex items-center space-x-1">
                    {isConnected ? (
                      <Wifi className="w-3 h-3 text-green-500" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs ${
                        isConnected ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isConnected ? "Connected" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems
            .filter((item) => !item.adminOnly || user?.is_admin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={handleMobileClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-6 py-4 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-l-4 touch-manipulation ${
                    isActive
                      ? "bg-gray-800 text-white border-white"
                      : "border-transparent hover:border-gray-600"
                  }`
                }
              >
                <div className="flex items-center min-w-0 flex-1">
                  <item.icon className="w-5 h-5 mr-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {item.adminOnly && (
                    <Shield className="w-3 h-3 text-yellow-500" />
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
              </NavLink>
            ))}

          {/* User Actions Section */}
          {user && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Account
                </p>
              </div>

              <button
                onClick={() => handleNavigation("/account-settings")}
                className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="font-medium">Account Settings</span>
              </button>

              <button
                onClick={() => handleNavigation("/change-password")}
                className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Key className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="font-medium">Change Password</span>
              </button>

              {user.is_admin && (
                <button
                  onClick={() => handleNavigation("/user-management")}
                  className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <UserCog className="w-5 h-5 mr-4 flex-shrink-0" />
                  <span className="font-medium">User Management</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  handleMobileClose();
                }}
                className="flex items-center w-full px-6 py-3 text-red-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex justify-between items-center">
              <span>Version 1.0.0</span>
              <span>© 2025 BadProxy</span>
            </div>
            {health && (
              <div className="text-xs text-gray-400">
                API: v{health.version} •{" "}
                {new Date(health.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Hook for managing sidebar state in parent components
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return {
    isOpen,
    toggle,
    close,
    open,
  };
};
