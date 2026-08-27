import React from 'react'

interface MandiMargLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  variant?: 'light' | 'dark'
}

export default function MandiMargLogo({
  className = '',
  size = 'md',
  showText = true,
  variant = 'light'
}: MandiMargLogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: 'text-base' },
    md: { icon: 44, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' },
    xl: { icon: 72, text: 'text-3xl' }
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div className={`flex items-center space-x-3 font-sans ${className}`}>
      {/* Mandi Marg Emblem Icon */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Outer Circle & Circuit Line */}
          <path
            d="M 60 10 A 50 50 0 1 1 20 80"
            stroke="#0C3823"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="95" cy="40" r="4" fill="#0C3823" />
          <path d="M 85 40 h 10 v 15 h 8" stroke="#0C3823" strokeWidth="2.5" />
          <circle cx="103" cy="55" r="3" fill="#0C3823" />

          {/* Golden Wheat Stalk */}
          <path d="M 25 75 Q 20 40, 42 20" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
          <path d="M 32 35 l -6 -8 M 34 30 l 7 -6 M 38 25 l -6 -8" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />

          {/* Green Agricultural Fields */}
          <path d="M 20 80 Q 60 65, 100 80 L 100 105 A 50 50 0 0 1 20 80 Z" fill="#0C3823" />
          <path d="M 25 82 Q 60 70, 95 82" stroke="#15803D" strokeWidth="2" />

          {/* Farmer Silhouette (Turban & Smartphone) */}
          <path
            d="M 45 42 C 40 32, 60 26, 68 36 C 74 30, 84 36, 78 44 C 70 48, 50 48, 45 42 Z"
            fill="#0C3823"
          />
          <ellipse cx="60" cy="50" rx="10" ry="12" fill="#0C3823" />
          <path d="M 42 66 L 78 66 L 82 80 L 38 80 Z" fill="#0C3823" />
          {/* Smartphone */}
          <rect x="76" y="50" width="8" height="14" rx="2" fill="#FFFFFF" stroke="#0C3823" strokeWidth="2" />

          {/* Golden Verified Checkmark Circle */}
          <circle cx="85" cy="85" r="11" fill="#EAB308" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 80 85 l 3 3 l 6 -6" stroke="#0C3823" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* MANDI MARG Text Branding */}
      {showText && (
        <div className="flex flex-col">
          {/* Top Two Leaves */}
          <div className="flex items-center space-x-1 mb-0.5">
            <svg width="18" height="10" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12 Q 12 0, 22 12 Q 12 14, 2 12 Z" fill="#15803D" />
            </svg>
            <div className="h-[1.5px] bg-[#0C3823] flex-grow rounded"></div>
          </div>

          <div className={`font-black tracking-tight leading-none ${currentSize.text} ${variant === 'dark' ? 'text-white' : 'text-[#0C3823]'}`}>
            <span>MANDI</span>
            <span className="block text-amber-500">MARG</span>
          </div>

          <div className="h-[1.5px] bg-[#0C3823] mt-0.5 rounded"></div>
        </div>
      )}
    </div>
  )
}
