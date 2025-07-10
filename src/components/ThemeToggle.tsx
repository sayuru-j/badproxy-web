import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check, ChevronDown } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "dropdown";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = "md",
  variant = "button",
  className = "",
}) => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: {
      button: "p-1.5 text-xs",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      button: "p-2 text-sm",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      button: "p-3 text-base",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };

  const currentSize = sizeClasses[size];

  const themeOptions = [
    {
      value: "light" as const,
      label: "Light",
      icon: Sun,
      description: "Light theme",
    },
    {
      value: "dark" as const,
      label: "Dark",
      icon: Moon,
      description: "Dark theme",
    },
    {
      value: "auto" as const,
      label: "Auto",
      icon: Monitor,
      description: "Follow system preference",
    },
  ];

  const getCurrentIcon = () => {
    if (theme === "auto") {
      return Monitor;
    }
    return effectiveTheme === "dark" ? Moon : Sun;
  };

  const getCurrentLabel = () => {
    if (theme === "auto") {
      return `Auto (${effectiveTheme})`;
    }
    return theme === "dark" ? "Dark" : "Light";
  };

  if (variant === "button") {
    const IconComponent = getCurrentIcon();

    return (
      <button
        onClick={toggleTheme}
        className={`
          ${currentSize.button} 
          ${
            effectiveTheme === "dark"
              ? "text-gray-400 hover:text-white hover:bg-gray-800"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          } 
          rounded-lg transition-colors 
          ${className}
        `}
        title={`Current theme: ${getCurrentLabel()}. Click to cycle themes.`}
      >
        <div className="flex items-center space-x-2">
          <IconComponent className={currentSize.icon} />
          {showLabel && (
            <span className={currentSize.text}>{getCurrentLabel()}</span>
          )}
        </div>
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${currentSize.button}
          ${
            effectiveTheme === "dark"
              ? "text-gray-400 hover:text-white hover:bg-gray-800 border-gray-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-300"
          }
          rounded-lg transition-colors border
          ${className}
        `}
      >
        <div className="flex items-center space-x-2">
          {React.createElement(getCurrentIcon(), {
            className: currentSize.icon,
          })}
          {showLabel && (
            <span className={currentSize.text}>{getCurrentLabel()}</span>
          )}
          <ChevronDown
            className={`${currentSize.icon} transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={`
          absolute right-0 mt-2 w-48 
          ${
            effectiveTheme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } 
          border rounded-lg shadow-lg z-50
        `}
        >
          <div className="p-1">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded transition-colors
                    ${
                      effectiveTheme === "dark"
                        ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                        : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                    }
                    ${
                      isSelected
                        ? effectiveTheme === "dark"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-900"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={currentSize.icon} />
                    <div className="text-left">
                      <p className={`font-medium ${currentSize.text}`}>
                        {option.label}
                        {option.value === "auto" && theme === "auto" && (
                          <span
                            className={`ml-1 ${
                              effectiveTheme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            ({effectiveTheme})
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-xs ${
                          effectiveTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className={`${currentSize.icon} ${
                        effectiveTheme === "dark"
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact theme toggle for mobile
export const CompactThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return <ThemeToggle size="sm" variant="button" className={className} />;
};

// Theme toggle with label for settings pages
export const LabeledThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <ThemeToggle size="md" variant="dropdown" showLabel className={className} />
  );
};
