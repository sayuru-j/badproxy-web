import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string | React.ReactNode
  className?: string
  action?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  noPadding?: boolean
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className = '', 
  action,
  size = 'md',
  noPadding = false
}) => {
  const sizeClasses = {
    sm: {
      container: 'text-sm',
      header: 'px-3 py-2 sm:px-4 sm:py-3',
      content: 'p-3 sm:p-4',
      title: 'text-sm sm:text-base font-medium',
    },
    md: {
      container: 'text-base',
      header: 'px-4 py-3 sm:px-6 sm:py-4',
      content: 'p-4 sm:p-6',
      title: 'text-base sm:text-lg font-semibold',
    },
    lg: {
      container: 'text-base sm:text-lg',
      header: 'px-4 py-4 sm:px-6 sm:py-5',
      content: 'p-4 sm:p-6 md:p-8',
      title: 'text-lg sm:text-xl font-semibold',
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg ${currentSize.container} ${className}`}>
      {title && (
        <div className={`${currentSize.header} border-b border-gray-700 flex items-center justify-between`}>
          {typeof title === 'string' ? (
            <h3 className={`${currentSize.title} text-white truncate`}>{title}</h3>
          ) : (
            <div className={`${currentSize.title} text-white w-full`}>{title}</div>
          )}
          {action && <div className="flex-shrink-0 ml-3">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : currentSize.content}>
        {children}
      </div>
    </div>
  )
}