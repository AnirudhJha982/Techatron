import React from 'react'

interface MandiMargLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  compact?: boolean
  variant?: 'light' | 'dark'
}

export default function MandiMargLogo({
  className = '',
  size = 'md',
  compact = false,
  variant = 'light'
}: MandiMargLogoProps) {
  // Width mapping for complete rectangular logo matching display rules (180px - 240px+)
  const widthClasses = {
    sm: 'w-[140px] sm:w-[160px]',
    md: 'w-[180px] sm:w-[220px]',
    lg: 'w-[240px] sm:w-[280px]',
    xl: 'w-[280px] sm:w-[340px]'
  }

  const compactSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  if (compact) {
    return (
      <div className={`relative overflow-hidden rounded-full flex-shrink-0 flex items-center justify-center ${compactSizeClasses[size] || 'w-10 h-10'} ${className}`}>
        <img
          src="/mandi-marg-logo.jpg"
          alt="Mandi Marg Emblem"
          className="w-full h-full object-cover scale-125 object-left"
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center flex-shrink-0 ${className}`}>
      <img
        src="/mandi-marg-logo.jpg"
        alt="Mandi Marg"
        className={`h-auto ${widthClasses[size] || 'w-[200px]'} object-contain drop-shadow-sm transition-all duration-200`}
        style={{ aspectRatio: 'auto' }}
      />
    </div>
  )
}
