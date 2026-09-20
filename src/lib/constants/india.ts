/**
 * Centralized India constants for MandiSetu.
 * Single source of truth for state list + phone validation.
 */

// ─── Complete list of Indian States & Union Territories ───────────────────────
export const INDIAN_STATES = [
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const

export type IndianState = (typeof INDIAN_STATES)[number]

/** Validates that a state value is in the canonical list (case-sensitive) */
export function isValidState(state: string): state is IndianState {
  return (INDIAN_STATES as readonly string[]).includes(state)
}

// ─── Phone Number Validation ───────────────────────────────────────────────────
/** Regex: 10-digit Indian mobile starting with 6-9 */
export const PHONE_REGEX = /^[6-9][0-9]{9}$/

/**
 * Validates an Indian mobile number.
 * Accepts exactly 10 digits starting with 6, 7, 8, or 9.
 * Rejects spaces, special characters, country codes.
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false
  const cleaned = phone.trim()
  return PHONE_REGEX.test(cleaned)
}

export const PHONE_ERROR_MESSAGE =
  "Enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)."
