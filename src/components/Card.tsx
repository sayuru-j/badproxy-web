import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string | React.ReactNode
  className?: string
  action?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', action }) => {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          ) : (
            <div className="text-lg font-semibold text-white w-full">{title}</div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}