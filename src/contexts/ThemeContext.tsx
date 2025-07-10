import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
    "dark"
  );

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("badproxy_theme") as Theme;

    if (savedTheme && ["light", "dark", "auto"].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      // Default to auto if no saved preference
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setThemeState("auto");
      setEffectiveTheme(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  // Update effective theme when theme changes or system preference changes
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (theme === "auto") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setEffectiveTheme(systemPrefersDark ? "dark" : "light");
      } else {
        setEffectiveTheme(theme);
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes when in auto mode
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateEffectiveTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (effectiveTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        effectiveTheme === "dark" ? "#111827" : "#f9fafb"
      );
    }
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("badproxy_theme", newTheme);
  };

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("auto");
    } else {
      setTheme("dark");
    }
  };

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Theme configuration object for easy access to colors
export const themeConfig = {
  light: {
    // Background colors
    bg: {
      primary: "bg-gray-50",
      secondary: "bg-white",
      tertiary: "bg-gray-100",
      accent: "bg-blue-50",
      danger: "bg-red-50",
      success: "bg-green-50",
      warning: "bg-yellow-50",
    },
    // Text colors
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-700",
      tertiary: "text-gray-500",
      accent: "text-blue-600",
      danger: "text-red-600",
      success: "text-green-600",
      warning: "text-yellow-600",
    },
    // Border colors
    border: {
      primary: "border-gray-200",
      secondary: "border-gray-300",
      accent: "border-blue-200",
      danger: "border-red-200",
      success: "border-green-200",
      warning: "border-yellow-200",
    },
    // Button colors
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
    },
  },
  dark: {
    // Background colors
    bg: {
      primary: "bg-black",
      secondary: "bg-gray-900",
      tertiary: "bg-gray-800",
      accent: "bg-blue-900/20",
      danger: "bg-red-900/20",
      success: "bg-green-900/20",
      warning: "bg-yellow-900/20",
    },
    // Text colors
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      tertiary: "text-gray-400",
      accent: "text-blue-400",
      danger: "text-red-400",
      success: "text-green-400",
      warning: "text-yellow-400",
    },
    // Border colors
    border: {
      primary: "border-gray-700",
      secondary: "border-gray-600",
      accent: "border-blue-600",
      danger: "border-red-600",
      success: "border-green-600",
      warning: "border-yellow-600",
    },
    // Button colors
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
    },
  },
};

// Helper hook to get current theme classes
export const useThemeClasses = () => {
  const { effectiveTheme } = useTheme();
  return themeConfig[effectiveTheme];
};
