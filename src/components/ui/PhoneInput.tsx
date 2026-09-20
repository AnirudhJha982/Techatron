"use client"

/**
 * PhoneInput — standardized Indian mobile number input.
 * Enforces: 10 digits, starts with 6-9, digits only.
 * Shows real-time inline validation feedback.
 * Use this everywhere a phone/mobile number is entered.
 */

import { useState } from "react"
import { validatePhone, PHONE_ERROR_MESSAGE } from "@/lib/constants/india"

interface PhoneInputProps {
  name?: string
  id?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  /** Use dark mode for forms with dark backgrounds */
  darkMode?: boolean
  className?: string
  showPrefix?: boolean
}

export default function PhoneInput({
  name = "phoneNumber",
  id,
  defaultValue = "",
  value: controlledValue,
  onChange,
  required = false,
  disabled = false,
  darkMode = false,
  className = "",
  showPrefix = true,
}: PhoneInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const displayValue = isControlled ? controlledValue : internalValue

  const isValid = displayValue.length === 0 ? null : validatePhone(displayValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything that isn't a digit
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
    if (!isControlled) setInternalValue(digits)
    onChange?.(digits)
  }

  const inputClass = darkMode
    ? `w-full bg-slate-950 border rounded-lg p-2.5 text-sm text-white font-bold focus:outline-none ${
        isValid === false
          ? "border-red-500 focus:border-red-400"
          : isValid === true
          ? "border-green-500 focus:border-green-400"
          : "border-slate-700 focus:border-yellow-400"
      } ${className}`
    : `flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isValid === false
          ? "border-red-400 focus:ring-red-400"
          : isValid === true
          ? "border-green-500 focus:ring-green-500"
          : "border-slate-300 focus:ring-green-600"
      } ${className}`

  return (
    <div className="space-y-1">
      <div className={`flex items-center ${showPrefix ? "gap-0" : ""}`}>
        {showPrefix && (
          <span
            className={`inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 text-sm font-semibold select-none ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-slate-400"
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}
          >
            +91
          </span>
        )}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[6-9][0-9]{9}"
          name={name}
          id={id ?? name}
          value={displayValue}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          maxLength={10}
          placeholder="9876543210"
          className={`${inputClass} ${showPrefix ? "rounded-l-none" : ""}`}
        />
      </div>

      {/* Inline validation feedback */}
      {displayValue.length > 0 && (
        <p
          className={`text-xs font-semibold ${
            isValid
              ? darkMode
                ? "text-green-400"
                : "text-green-700"
              : darkMode
              ? "text-red-400"
              : "text-red-600"
          }`}
        >
          {isValid ? "✓ Valid 10-digit mobile number" : PHONE_ERROR_MESSAGE}
        </p>
      )}
    </div>
  )
}
