"use client"

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
  // Dimensions & font size scaling
  const sizeConfig = {
    sm: { icon: 34, title: 'text-sm', sub: 'text-[9px]', space: 'space-x-2' },
    md: { icon: 44, title: 'text-lg', sub: 'text-[10px]', space: 'space-x-3' },
    lg: { icon: 54, title: 'text-2xl', sub: 'text-xs', space: 'space-x-3.5' },
    xl: { icon: 68, title: 'text-3xl', sub: 'text-sm', space: 'space-x-4' }
  }

  const config = sizeConfig[size] || sizeConfig.md

  return (
    <div className={`flex items-center ${config.space} font-sans select-none ${className}`}>
      {/* Crisp Agricultural Digital Vector Emblem SVG */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={config.icon}
          height={config.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm transition-transform duration-200 hover:scale-105"
        >
          {/* Outer Deep Green Circular Border */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={variant === 'dark' ? '#082b1b' : '#f4f8f4'}
            stroke={variant === 'dark' ? '#15803d' : '#0c3823'}
            strokeWidth="3.5"
          />

          {/* Golden Wheat Stalk (Left Arc) */}
          <path
            d="M 22 75 Q 18 42, 40 20"
            stroke="#eab308"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M 27 38 L 20 30" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 31 30 L 38 23" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 35 24 L 28 15" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />

          {/* Digital Tech Circuit Line (Right Top Arc) */}
          <path
            d="M 60 14 L 75 14 L 75 32 L 85 32"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="75" cy="14" r="3" fill="#22c55e" />
          <circle cx="85" cy="32" r="3.5" fill="#eab308" />

          {/* Green Agricultural Fields Arc (Bottom) */}
          <path
            d="M 12 62 Q 50 48, 88 62 A 45 45 0 0 1 12 62 Z"
            fill={variant === 'dark' ? '#15803d' : '#0c3823'}
          />
          <path d="M 18 64 Q 50 54, 82 64" stroke="#4ade80" strokeWidth="1.8" />

          {/* Farmer Silhouette Profile with Turban */}
          {/* Turban Head */}
          <path
            d="M 38 46 C 34 36, 52 30, 60 38 C 66 33, 74 38, 70 46 C 63 50, 44 50, 38 46 Z"
            fill={variant === 'dark' ? '#fef08a' : '#0c3823'}
          />
          {/* Face Profile */}
          <ellipse cx="51" cy="52" rx="9" ry="10" fill={variant === 'dark' ? '#ffffff' : '#15803d'} />
          {/* Shoulders */}
          <path
            d="M 36 66 C 36 58, 66 58, 66 66 Z"
            fill={variant === 'dark' ? '#fef08a' : '#0c3823'}
          />

          {/* Golden Verified Checkmark Badge (Bottom Right) */}
          <circle cx="74" cy="74" r="10" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
          <path
            d="M 69 74 L 72 77 L 78 71"
            stroke="#0c3823"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* HTML / CSS MANDI MARG Typography */}
      {!compact && (
        <div className="flex flex-col leading-none">
          {/* Leaf & Tech Accent Header Bar */}
          <div className="flex items-center space-x-1.5 mb-1">
            <svg width="14" height="8" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 2 10 Q 10 0, 18 10 Q 10 12, 2 10 Z" fill="#22c55e" />
            </svg>
            <div className={`h-[2px] flex-grow rounded-full ${variant === 'dark' ? 'bg-amber-400/80' : 'bg-[#0c3823]'}`}></div>
          </div>

          {/* Main Brand Title: MANDI MARG */}
          <div className={`font-black tracking-tight uppercase ${config.title} ${variant === 'dark' ? 'text-white' : 'text-[#0c3823]'}`}>
            <span>MANDI</span>
            <span className={`ml-1.5 ${variant === 'dark' ? 'text-yellow-400' : 'text-amber-600'}`}>MARG</span>
          </div>

          {/* Subtitle Badge */}
          <span className={`font-bold tracking-wider uppercase mt-0.5 ${config.sub} ${variant === 'dark' ? 'text-emerald-300' : 'text-slate-600'}`}>
            Digital Mandi Platform
          </span>
        </div>
      )}
    </div>
  )
}
