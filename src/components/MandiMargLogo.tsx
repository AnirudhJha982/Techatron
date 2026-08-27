"use client"

import React from 'react'
import { MANDI_MARG_EMBLEM_LOGO } from './logoData'

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
  // Proportional sizing matching high-DPI resolution
  const sizeConfig = {
    sm: { emblem: 'w-9 h-9', title: 'text-sm font-black', sub: 'text-[8px]', space: 'space-x-2' },
    md: { emblem: 'w-12 h-12 sm:w-14 sm:h-14', title: 'text-xl font-black', sub: 'text-[9px]', space: 'space-x-3' },
    lg: { emblem: 'w-16 h-16 sm:w-20 sm:h-20', title: 'text-2xl sm:text-3xl font-black', sub: 'text-xs', space: 'space-x-3.5' },
    xl: { emblem: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-3xl sm:text-4xl font-black', sub: 'text-sm', space: 'space-x-4' }
  }

  const config = sizeConfig[size] || sizeConfig.md

  return (
    <div className={`flex items-center ${config.space} font-sans select-none ${className}`}>
      {/* High-Resolution Detailed Mandi Marg Emblem */}
      <div className={`relative flex-shrink-0 flex items-center justify-center ${config.emblem}`}>
        <img
          src={MANDI_MARG_EMBLEM_LOGO || '/mandi-marg-emblem.png'}
          alt="Mandi Marg Emblem"
          className="w-full h-full object-contain drop-shadow-md transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/mandi-marg-emblem.png'
          }}
        />
      </div>

      {/* MANDI MARG Text Typography */}
      {!compact && (
        <div className="flex flex-col leading-none">
          {/* Accent bar */}
          <div className="flex items-center space-x-1.5 mb-1">
            <svg width="12" height="6" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 2 10 Q 10 0, 18 10 Q 10 12, 2 10 Z" fill="#22c55e" />
            </svg>
            <div className={`h-[2px] flex-grow rounded-full ${variant === 'dark' ? 'bg-amber-400/80' : 'bg-[#0c3823]'}`}></div>
          </div>

          <div className={`tracking-tight uppercase ${config.title} ${variant === 'dark' ? 'text-white' : 'text-[#0c3823]'}`}>
            <span>MANDI</span>
            <span className={`ml-1.5 ${variant === 'dark' ? 'text-yellow-400' : 'text-amber-600'}`}>MARG</span>
          </div>

          <span className={`font-bold tracking-wider uppercase mt-0.5 ${config.sub} ${variant === 'dark' ? 'text-emerald-300' : 'text-slate-500'}`}>
            Digital Mandi Platform
          </span>
        </div>
      )}
    </div>
  )
}
