import { Loader2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface LoadingProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  size = "md",
  className = "",
  fullScreen = false,
  inline = false,
}) => {
  const { effectiveTheme } = useTheme();

  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5 sm:w-6 sm:h-6",
    lg: "w-6 h-6 sm:w-8 sm:h-8",
    xl: "w-8 h-8 sm:w-10 sm:h-10",
  };

  const paddingClasses = {
    xs: "p-2",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6 md:p-8",
    lg: "p-6 sm:p-8 md:p-12",
    xl: "p-8 sm:p-12 md:p-16",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-sm sm:text-base md:text-lg",
    xl: "text-base sm:text-lg md:text-xl",
  };

  // Inline variant for buttons or small spaces
  if (inline) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2
          className={`
          ${sizeClasses[size]} animate-spin 
          ${effectiveTheme === "dark" ? "text-gray-400" : "text-gray-600"}
        `}
        />
        {message && (
          <span
            className={`
            ${textSizeClasses[size]} 
            ${effectiveTheme === "dark" ? "text-gray-400" : "text-gray-600"}
            truncate
          `}
          >
            {message}
          </span>
        )}
      </div>
    );
  }

  // Full screen variant
  if (fullScreen) {
    return (
      <div
        className={`
        fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 
        ${effectiveTheme === "dark" ? "bg-black/50" : "bg-gray-900/50"}
        ${className}
      `}
      >
        <div
          className={`
          ${
            effectiveTheme === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }
          rounded-lg border p-6 sm:p-8 max-w-sm mx-4 text-center transition-colors duration-200
        `}
        >
          <Loader2
            className={`
            ${sizeClasses[size]} animate-spin mx-auto mb-4
            ${effectiveTheme === "dark" ? "text-white" : "text-gray-900"}
          `}
          />
          {message && (
            <p
              className={`
              ${textSizeClasses[size]} 
              ${effectiveTheme === "dark" ? "text-gray-300" : "text-gray-700"}
            `}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default centered variant
  return (
    <div
      className={`
      flex flex-col items-center justify-center ${paddingClasses[size]} 
      ${effectiveTheme === "dark" ? "text-gray-400" : "text-gray-600"}
      ${className}
    `}
    >
      <Loader2
        className={`
        ${sizeClasses[size]} animate-spin mb-2 sm:mb-3
        ${effectiveTheme === "dark" ? "text-gray-400" : "text-gray-600"}
      `}
      />
      {message && (
        <p
          className={`
          ${
            textSizeClasses[size]
          } text-center max-w-xs sm:max-w-sm md:max-w-md px-2
          ${effectiveTheme === "dark" ? "text-gray-400" : "text-gray-600"}
        `}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// Specialized loading components for common use cases
export const ButtonLoading: React.FC<{ size?: "xs" | "sm" | "md" }> = ({
  size = "sm",
}) => <Loading size={size} message="" inline className="justify-center" />;

export const PageLoading: React.FC<{ message?: string }> = ({
  message = "Loading page...",
}) => <Loading size="lg" message={message} className="min-h-[50vh]" />;

export const CardLoading: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => <Loading size="md" message={message} className="py-8 sm:py-12" />;

export const OverlayLoading: React.FC<{ message?: string }> = ({
  message = "Processing...",
}) => <Loading size="lg" message={message} fullScreen />;
