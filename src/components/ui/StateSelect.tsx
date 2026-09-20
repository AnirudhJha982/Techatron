/**
 * StateSelect — standardized Indian state/UT dropdown.
 * Use this everywhere a state must be selected. Never use a free-text input for state.
 */

import { INDIAN_STATES } from "@/lib/constants/india"

interface StateSelectProps {
  name?: string
  id?: string
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  disabled?: boolean
  /** Use dark mode for forms with dark backgrounds (e.g. VerificationWizard) */
  darkMode?: boolean
  className?: string
  placeholder?: string
}

export default function StateSelect({
  name = "state",
  id,
  defaultValue,
  value,
  onChange,
  required = false,
  disabled = false,
  darkMode = false,
  className = "",
  placeholder = "-- Select State / UT --",
}: StateSelectProps) {
  const baseClass = darkMode
    ? "w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none disabled:opacity-50"
    : "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const props: React.SelectHTMLAttributes<HTMLSelectElement> = {
    name,
    id: id ?? name,
    required,
    disabled,
    className: `${baseClass} ${className}`,
  }

  // Support both controlled and uncontrolled usage
  if (value !== undefined) {
    props.value = value
    props.onChange = onChange
  } else {
    props.defaultValue = defaultValue ?? ""
  }

  return (
    <select {...props}>
      <option value="" disabled>
        {placeholder}
      </option>
      {INDIAN_STATES.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  )
}
