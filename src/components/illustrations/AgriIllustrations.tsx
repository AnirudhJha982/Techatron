import React from 'react'

export function FarmerHeroIllustration() {
  return (
    <div className="relative w-full max-w-[280px] h-[120px] sm:h-[140px] flex items-end justify-center overflow-hidden rounded-xl">
      <svg viewBox="0 0 320 160" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sky & Sun Background */}
        <path d="M0 0h320v160H0z" fill="#FEF9C3" fillOpacity="0.4" />
        <circle cx="260" cy="45" r="30" fill="#FACC15" fillOpacity="0.7" />

        {/* Distant Hills */}
        <path d="M-20 140 Q 60 80, 160 120 T 340 100 V 160 H -20 Z" fill="#A7F3D0" fillOpacity="0.5" />
        <path d="M40 140 Q 140 90, 240 130 T 360 110 V 160 H 40 Z" fill="#6EE7B7" fillOpacity="0.4" />

        {/* Barn / Mandi Shed */}
        <path d="M220 100 l25-18 25 18 v35 h-50 z" fill="#D97706" />
        <path d="M220 100 l25-18 25 18" stroke="#78350F" strokeWidth="3" />
        <rect x="235" y="115" width="20" height="20" fill="#78350F" rx="2" />

        {/* Tractor Silhouette */}
        <g transform="translate(160, 105) scale(0.6)">
          <rect x="20" y="10" width="30" height="20" fill="#DC2626" rx="3" />
          <rect x="35" y="0" width="15" height="15" fill="#1E293B" rx="2" />
          <circle cx="15" cy="30" r="10" fill="#334155" stroke="#F8FAFC" strokeWidth="2" />
          <circle cx="45" cy="25" r="14" fill="#334155" stroke="#F8FAFC" strokeWidth="2" />
        </g>

        {/* Wheat Stalks (Golden Crops) */}
        <g stroke="#CA8A04" strokeWidth="2" strokeLinecap="round">
          <path d="M10 160 C 15 130, 20 110, 15 90 M 15 110 l -5 -8 M 15 100 l 6 -8 M 15 90 l -5 -8" />
          <path d="M30 160 C 35 125, 40 105, 38 85 M 38 105 l -5 -8 M 38 95 l 6 -8 M 38 85 l -5 -8" />
          <path d="M50 160 C 52 135, 55 115, 50 95 M 50 115 l -5 -8 M 50 105 l 6 -8" />
          <path d="M280 160 C 285 130, 290 110, 285 90 M 285 110 l -5 -8 M 285 100 l 6 -8" />
          <path d="M300 160 C 302 125, 305 105, 302 85 M 302 105 l -5 -8 M 302 95 l 6 -8" />
        </g>

        {/* Ground / Wheat Field */}
        <path d="M0 135 Q 160 145, 320 135 V 160 H 0 Z" fill="#EAB308" fillOpacity="0.8" />
        <path d="M0 145 Q 160 152, 320 145 V 160 H 0 Z" fill="#CA8A04" />

        {/* Indian Farmer Character */}
        <g transform="translate(105, 40)">
          {/* Turban (Pagri) */}
          <path d="M32 24 C 20 10, 50 2, 60 16 C 68 8, 80 16, 74 26 C 80 32, 70 42, 60 38 C 50 42, 35 40, 32 24 Z" fill="#F97316" />
          <path d="M40 18 Q 55 12, 66 22" stroke="#EA580C" strokeWidth="2" />
          
          {/* Face */}
          <ellipse cx="52" cy="40" rx="14" ry="16" fill="#FDBA74" />
          {/* Eyes */}
          <circle cx="46" cy="38" r="2" fill="#431407" />
          <circle cx="58" cy="38" r="2" fill="#431407" />
          {/* Mustache */}
          <path d="M42 46 Q 52 50, 62 46 Q 52 54, 42 46 Z" fill="#431407" />
          
          {/* Body / Kurta */}
          <path d="M30 60 L 74 60 L 82 110 L 22 110 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Jacket (Sadri / Nehru Vest) */}
          <path d="M32 60 L 50 60 L 50 105 L 28 105 Z" fill="#047857" />
          <path d="M72 60 L 54 60 L 54 105 L 76 105 Z" fill="#047857" />

          {/* Arms (Folded / Welcoming) */}
          <path d="M22 65 Q 15 80, 35 90" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />
          <path d="M82 65 Q 89 80, 69 90" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

export function GrainSackIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="w-12 h-12 text-amber-600" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grain Sack */}
      <path d="M20 30 Q 15 50, 22 70 Q 40 76, 58 70 Q 65 50, 60 30 Q 40 24, 20 30 Z" fill="#D97706" />
      <path d="M22 32 Q 40 26, 58 32" stroke="#B45309" strokeWidth="2" />
      {/* Tie Rope */}
      <rect x="30" y="24" width="20" height="6" fill="#FEF08A" rx="2" stroke="#CA8A04" strokeWidth="1" />
      {/* Golden Wheat Grains Spilling */}
      <ellipse cx="40" cy="18" rx="12" ry="6" fill="#FACC15" />
      <circle cx="34" cy="16" r="1.5" fill="#78350F" />
      <circle cx="40" cy="15" r="1.5" fill="#78350F" />
      <circle cx="45" cy="17" r="1.5" fill="#78350F" />
      <path d="M30 45 h 20 M 26 55 h 28" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  )
}

export function DBTPaymentIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Safe Box / Bank Vault */}
      <rect x="15" y="30" width="50" height="42" rx="8" fill="#047857" stroke="#064E3B" strokeWidth="2" />
      <circle cx="40" cy="51" r="12" fill="#064E3B" />
      <circle cx="40" cy="51" r="6" fill="#FACC15" />
      {/* Rupee Coins Stack */}
      <ellipse cx="25" cy="24" rx="10" ry="4" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <ellipse cx="25" cy="20" rx="10" ry="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      <ellipse cx="55" cy="22" rx="10" ry="4" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      {/* Green Growth Leaf */}
      <path d="M50 15 Q 65 5, 70 20 Q 55 25, 50 15 Z" fill="#22C55E" />
    </svg>
  )
}

export function QueuePathIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Winding Road / Mandi Path */}
      <path d="M10 70 Q 40 60, 30 40 T 70 15" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
      <path d="M10 70 Q 40 60, 30 40 T 70 15" stroke="#F8FAFC" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      {/* People / Farmers Nodes */}
      <circle cx="20" cy="63" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="30" cy="42" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="58" cy="22" r="6" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  )
}

export function TokenPassIllustration() {
  return (
    <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ticket Pass Ticket Shape */}
      <path d="M10 25 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v8 a6 6 0 0 0 0 12 v8 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-8 a6 6 0 0 0 0 -12 z" fill="#15803D" stroke="#FACC15" strokeWidth="2" />
      <line x1="50" y1="20" x2="50" y2="54" stroke="#FACC15" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="30" cy="37" r="8" fill="#FACC15" />
      <path d="M27 37 l2 2 l4 -4" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
