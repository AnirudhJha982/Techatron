"use client"

import * as React from "react"

export function Accordion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`divide-y divide-slate-200 ${className}`}>{children}</div>
}

export function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <div className="py-3">{children}</div>
}

export function AccordionTrigger({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex justify-between items-center text-left text-base font-bold text-slate-900 py-2 hover:text-green-800 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export function AccordionContent({ children, isOpen = true }: { children: React.ReactNode; isOpen?: boolean }) {
  if (!isOpen) return null
  return <div className="text-sm text-slate-600 pt-2 pb-3 leading-relaxed">{children}</div>
}
