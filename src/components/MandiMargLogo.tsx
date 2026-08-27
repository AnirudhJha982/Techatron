"use client"

import React from 'react'
import { MANDI_MARG_LOGO_LIGHT, MANDI_MARG_LOGO_DARK } from './logoData'

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
  // Proportional width mapping matching desktop rule (220px - 280px+)
  const widthClasses = {
    sm: 'w-[150px] sm:w-[190px]',
    md: 'w-[200px] sm:w-[245px]',
    lg: 'w-[250px] sm:w-[300px]',
    xl: 'w-[300px] sm:w-[380px]'
  }

  const compactSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const logoSrc = variant === 'dark'
    ? (MANDI_MARG_LOGO_DARK || MANDI_MARG_LOGO_LIGHT)
    : (MANDI_MARG_LOGO_LIGHT || MANDI_MARG_LOGO_DARK)

  if (compact) {
    return (
      <div className={`relative overflow-hidden rounded-full flex-shrink-0 flex items-center justify-center ${compactSizeClasses[size] || 'w-10 h-10'} ${className}`}>
        <img
          src={logoSrc}
          alt="Mandi Marg Emblem"
          className="w-full h-full object-cover scale-125 object-left"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/mandi-marg-logo-transparent.png"
          }}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center flex-shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt="Mandi Marg"
        className={`h-auto ${widthClasses[size] || 'w-[245px]'} max-w-full object-contain transition-all duration-200`}
        style={{ aspectRatio: 'auto' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/mandi-marg-logo-transparent.png"
        }}
      />
    </div>
  )
}
