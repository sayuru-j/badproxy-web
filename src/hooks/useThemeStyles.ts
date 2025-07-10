import { useTheme } from "../contexts/ThemeContext";

// Utility hook for getting theme-aware styles
const useThemeStyles = () => {
  const { effectiveTheme } = useTheme();

  const styles = {
    // Background styles
    bg: {
      primary: effectiveTheme === "dark" ? "bg-black" : "bg-gray-50",
      secondary: effectiveTheme === "dark" ? "bg-gray-900" : "bg-white",
      tertiary: effectiveTheme === "dark" ? "bg-gray-800" : "bg-gray-100",
      accent: effectiveTheme === "dark" ? "bg-blue-900/20" : "bg-blue-50",
      danger: effectiveTheme === "dark" ? "bg-red-900/20" : "bg-red-50",
      success: effectiveTheme === "dark" ? "bg-green-900/20" : "bg-green-50",
      warning: effectiveTheme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50",
    },

    // Text styles
    text: {
      primary: effectiveTheme === "dark" ? "text-white" : "text-gray-900",
      secondary: effectiveTheme === "dark" ? "text-gray-300" : "text-gray-700",
      tertiary: effectiveTheme === "dark" ? "text-gray-400" : "text-gray-500",
      muted: effectiveTheme === "dark" ? "text-gray-500" : "text-gray-400",
      accent: effectiveTheme === "dark" ? "text-blue-400" : "text-blue-600",
      danger: effectiveTheme === "dark" ? "text-red-400" : "text-red-600",
      success: effectiveTheme === "dark" ? "text-green-400" : "text-green-600",
      warning:
        effectiveTheme === "dark" ? "text-yellow-400" : "text-yellow-600",
    },

    // Border styles
    border: {
      primary:
        effectiveTheme === "dark" ? "border-gray-700" : "border-gray-200",
      secondary:
        effectiveTheme === "dark" ? "border-gray-600" : "border-gray-300",
      accent: effectiveTheme === "dark" ? "border-blue-600" : "border-blue-300",
      danger: effectiveTheme === "dark" ? "border-red-600" : "border-red-300",
      success:
        effectiveTheme === "dark" ? "border-green-600" : "border-green-300",
      warning:
        effectiveTheme === "dark" ? "border-yellow-600" : "border-yellow-300",
    },

    // Button styles
    button: {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700",
      secondary:
        effectiveTheme === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-700 hover:border-gray-600"
          : "bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-200 hover:border-gray-300",
      danger:
        "bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700",
      success:
        "bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700",
      ghost:
        effectiveTheme === "dark"
          ? "bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent"
          : "bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-transparent",
    },

    // Input styles
    input:
      effectiveTheme === "dark"
        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 focus:ring-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500",

    // Card styles
    card:
      effectiveTheme === "dark"
        ? "bg-gray-900 border-gray-700"
        : "bg-white border-gray-200",

    // Hover effects
    hover: {
      card:
        effectiveTheme === "dark"
          ? "hover:border-gray-600"
          : "hover:border-gray-300",
      button:
        effectiveTheme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
    },
  };

  return styles;
};

// Helper function to combine theme classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Theme-aware class generator
const themeClass = (darkClass: string, lightClass: string) => {
  return `${darkClass} dark:${darkClass} light:${lightClass}`;
};

// Responsive theme classes
const responsiveThemeClass = (
  base: string,
  dark: string,
  light: string,
  responsive?: { sm?: string; md?: string; lg?: string }
) => {
  let classes = `${base} ${themeClass(dark, light)}`;

  if (responsive) {
    if (responsive.sm) classes += ` sm:${responsive.sm}`;
    if (responsive.md) classes += ` md:${responsive.md}`;
    if (responsive.lg) classes += ` lg:${responsive.lg}`;
  }

  return classes;
};

// Status color utilities
const getStatusColors = (
  status: "success" | "error" | "warning" | "info",
  effectiveTheme: "light" | "dark"
) => {
  const colors = {
    success: {
      dark: {
        bg: "bg-green-900/20",
        text: "text-green-400",
        border: "border-green-600",
      },
      light: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
    },
    error: {
      dark: {
        bg: "bg-red-900/20",
        text: "text-red-400",
        border: "border-red-600",
      },
      light: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
      },
    },
    warning: {
      dark: {
        bg: "bg-yellow-900/20",
        text: "text-yellow-400",
        border: "border-yellow-600",
      },
      light: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-200",
      },
    },
    info: {
      dark: {
        bg: "bg-blue-900/20",
        text: "text-blue-400",
        border: "border-blue-600",
      },
      light: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
    },
  };

  return colors[status][effectiveTheme];
};

// Theme transition classes
const THEME_TRANSITION = "transition-colors duration-200";

// Common component class combinations
const getComponentClasses = (effectiveTheme: "light" | "dark") => ({
  // Page container
  pageContainer: cn(
    "min-h-screen",
    effectiveTheme === "dark"
      ? "bg-black text-white"
      : "bg-gray-50 text-gray-900",
    THEME_TRANSITION
  ),

  // Navigation
  navLink: cn(
    "flex items-center px-6 py-3 transition-colors",
    effectiveTheme === "dark"
      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  ),

  // Form elements
  formInput: cn(
    "w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    effectiveTheme === "dark"
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    THEME_TRANSITION
  ),

  // Modal
  modal: cn(
    "rounded-lg shadow-xl border",
    effectiveTheme === "dark"
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-gray-200"
  ),

  // Dropdown
  dropdown: cn(
    "border rounded-lg shadow-lg",
    effectiveTheme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200"
  ),
});

// Export all utilities
export {
  useThemeStyles,
  cn,
  themeClass,
  responsiveThemeClass,
  getStatusColors,
  THEME_TRANSITION,
  getComponentClasses,
};
