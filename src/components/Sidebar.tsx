import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  FileText,
  Activity,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";

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
  },
  {
    to: "/config",
    label: "Config",
    icon: FileText,
    shortLabel: "Config",
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

  // Track current path for mobile breadcrumb
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    
    // Listen for route changes
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      handleMobileClose(); // Close mobile menu on route change
    };

    // Listen for both popstate and pushstate/replacestate
    window.addEventListener("popstate", handleLocationChange);
    
    // Override pushState and replaceState to detect programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Get current page info for mobile
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
          {navItems.map((item) => (
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
          {/* Mobile Logo & Menu Button */}
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

          {/* Mobile Breadcrumb */}
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Home className="w-4 h-4 flex-shrink-0" />
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-300 truncate">
              {getCurrentPageInfo().shortLabel}
            </span>
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

        {/* Mobile Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
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
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Footer */}
        <div className="p-6 border-t border-gray-800">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex justify-between items-center">
              <span>Version 1.0.0</span>
              <span>© 2025 BadProxy</span>
            </div>
            <div className="mt-3 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-xs">
                💡 Tap outside menu to close
              </p>
            </div>
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