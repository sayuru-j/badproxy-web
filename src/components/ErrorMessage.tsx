import { AlertTriangle, RefreshCw, X, Info, AlertCircle, CheckCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'error' | 'warning' | 'info' | 'success'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  fullWidth?: boolean
  compact?: boolean
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'error',
  size = 'md',
  title,
  fullWidth = true,
  compact = false,
  className = ''
}) => {
  const variants = {
    error: {
      styles: 'border-red-600 bg-red-900/20 text-red-400',
      icon: AlertCircle,
      iconColor: 'text-red-400'
    },
    warning: {
      styles: 'border-yellow-600 bg-yellow-900/20 text-yellow-400',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400'
    },
    info: {
      styles: 'border-blue-600 bg-blue-900/20 text-blue-400',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    success: {
      styles: 'border-green-600 bg-green-900/20 text-green-400',
      icon: CheckCircle,
      iconColor: 'text-green-400'
    }
  }

  const sizeClasses = {
    sm: {
      container: 'p-2 sm:p-3',
      icon: 'w-4 h-4',
      text: 'text-xs sm:text-sm',
      title: 'text-sm font-medium',
      button: 'p-1',
      buttonIcon: 'w-3 h-3',
      spacing: 'space-x-2'
    },
    md: {
      container: 'p-3 sm:p-4',
      icon: 'w-4 h-4 sm:w-5 sm:h-5',
      text: 'text-sm sm:text-base',
      title: 'text-sm sm:text-base font-medium',
      button: 'p-1 sm:p-1.5',
      buttonIcon: 'w-3 h-3 sm:w-4 sm:h-4',
      spacing: 'space-x-2 sm:space-x-3'
    },
    lg: {
      container: 'p-4 sm:p-6',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      text: 'text-sm sm:text-base md:text-lg',
      title: 'text-base sm:text-lg font-semibold',
      button: 'p-1.5 sm:p-2',
      buttonIcon: 'w-4 h-4 sm:w-5 sm:h-5',
      spacing: 'space-x-3 sm:space-x-4'
    }
  }

  const currentVariant = variants[variant]
  const currentSize = sizeClasses[size]
  const IconComponent = currentVariant.icon

  // Compact layout for mobile when compact=true
  if (compact) {
    return (
      <div className={`border rounded-lg ${currentSize.container} ${currentVariant.styles} ${fullWidth ? 'w-full' : ''} ${className}`}>
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col space-y-2 sm:hidden">
          <div className="flex items-start space-x-2">
            <IconComponent className={`${currentSize.icon} mt-0.5 flex-shrink-0 ${currentVariant.iconColor}`} />
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`${currentSize.title} mb-1`}>{title}</h4>
              )}
              <p className={`${currentSize.text}`}>{message}</p>
            </div>
          </div>
          {(onRetry || onDismiss) && (
            <div className="flex items-center justify-end space-x-2 pt-1">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`${currentSize.button} hover:bg-white/10 rounded transition-colors flex items-center space-x-1`}
                  title="Retry"
                >
                  <RefreshCw className={currentSize.buttonIcon} />
                  <span className="text-xs">Retry</span>
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${currentSize.button} hover:bg-white/10 rounded transition-colors flex items-center space-x-1`}
                  title="Dismiss"
                >
                  <X className={currentSize.buttonIcon} />
                  <span className="text-xs">Dismiss</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex items-start space-x-3">
          <IconComponent className={`${currentSize.icon} mt-0.5 flex-shrink-0 ${currentVariant.iconColor}`} />
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`${currentSize.title} mb-1`}>{title}</h4>
            )}
            <p className={`${currentSize.text}`}>{message}</p>
          </div>
          {(onRetry || onDismiss) && (
            <div className="flex items-center space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`${currentSize.button} hover:bg-white/10 rounded transition-colors`}
                  title="Retry"
                >
                  <RefreshCw className={currentSize.buttonIcon} />
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${currentSize.button} hover:bg-white/10 rounded transition-colors`}
                  title="Dismiss"
                >
                  <X className={currentSize.buttonIcon} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default layout
  return (
    <div className={`border rounded-lg ${currentSize.container} ${currentVariant.styles} ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className={`flex items-start ${currentSize.spacing}`}>
        <IconComponent className={`${currentSize.icon} mt-0.5 flex-shrink-0 ${currentVariant.iconColor}`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`${currentSize.title} mb-1`}>{title}</h4>
          )}
          <p className={`${currentSize.text} break-words`}>{message}</p>
        </div>
        
        {/* Action buttons */}
        {(onRetry || onDismiss) && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0 ml-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`${currentSize.button} hover:bg-white/10 rounded transition-colors flex items-center space-x-1 sm:space-x-0`}
                title="Retry"
              >
                <RefreshCw className={currentSize.buttonIcon} />
                <span className="text-xs sm:hidden">Retry</span>
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`${currentSize.button} hover:bg-white/10 rounded transition-colors flex items-center space-x-1 sm:space-x-0`}
                title="Dismiss"
              >
                <X className={currentSize.buttonIcon} />
                <span className="text-xs sm:hidden">Dismiss</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Specialized error message components
export const InlineError: React.FC<{ message: string; onDismiss?: () => void }> = ({ 
  message, 
  onDismiss 
}) => (
  <ErrorMessage 
    message={message} 
    onDismiss={onDismiss}
    variant="error" 
    size="sm" 
    compact
    fullWidth={false}
  />
)

export const SuccessMessage: React.FC<{ 
  message: string; 
  title?: string;
  onDismiss?: () => void 
}> = ({ message, title, onDismiss }) => (
  <ErrorMessage 
    message={message}
    title={title}
    onDismiss={onDismiss}
    variant="success"
    size="md"
  />
)

export const WarningBanner: React.FC<{ 
  message: string; 
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void 
}> = ({ message, title, onRetry, onDismiss }) => (
  <ErrorMessage 
    message={message}
    title={title}
    onRetry={onRetry}
    onDismiss={onDismiss}
    variant="warning"
    size="lg"
  />
)