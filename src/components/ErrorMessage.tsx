import { AlertTriangle, RefreshCw, X } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'error' | 'warning' | 'info'
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'error'
}) => {
  const variants = {
    error: 'border-red-600 bg-red-900/20 text-red-400',
    warning: 'border-yellow-600 bg-yellow-900/20 text-yellow-400',
    info: 'border-blue-600 bg-blue-900/20 text-blue-400'
  }

  return (
    <div className={`border rounded-lg p-4 ${variants[variant]}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}