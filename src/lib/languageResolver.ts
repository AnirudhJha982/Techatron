export const STATE_TO_LANGUAGE: Record<string, string> = {
  'Andhra Pradesh': 'te',
  'Arunachal Pradesh': 'en',
  'Assam': 'as',
  'Bihar': 'hi',
  'Chhattisgarh': 'hi',
  'Goa': 'kok',
  'Gujarat': 'gu',
  'Haryana': 'hi',
  'Himachal Pradesh': 'hi',
  'Jharkhand': 'hi',
  'Karnataka': 'kn',
  'Kerala': 'ml',
  'Madhya Pradesh': 'hi',
  'Maharashtra': 'mr',
  'Manipur': 'mni',
  'Meghalaya': 'en',
  'Mizoram': 'en',
  'Nagaland': 'en',
  'Odisha': 'or',
  'Punjab': 'pa',
  'Rajasthan': 'hi',
  'Sikkim': 'ne',
  'Tamil Nadu': 'ta',
  'Telangana': 'te',
  'Tripura': 'bn',
  'Uttar Pradesh': 'hi',
  'Uttarakhand': 'hi',
  'West Bengal': 'bn',
  // Union Territories
  'Delhi': 'hi',
  'Jammu and Kashmir': 'ks',
  'Ladakh': 'en',
  'Puducherry': 'ta',
  'Chandigarh': 'hi',
  'Dadra and Nagar Haveli and Daman and Diu': 'gu',
  'Andaman and Nicobar Islands': 'en',
  'Lakshadweep': 'ml'
}

export const LANGUAGE_NAMES: Record<string, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिन्दी", english: "Hindi" },
  bn: { native: "বাংলা", english: "Bengali" },
  as: { native: "অসমীয়া", english: "Assamese" },
  or: { native: "ଓଡ଼ିଆ", english: "Odia" },
  mr: { native: "मराठी", english: "Marathi" },
  gu: { native: "ગુજરાતી", english: "Gujarati" },
  pa: { native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  ta: { native: "தமிழ்", english: "Tamil" },
  te: { native: "తెలుగు", english: "Telugu" },
  kn: { native: "ಕನ್ನಡ", english: "Kannada" },
  ml: { native: "മലയാളം", english: "Malayalam" },
  ur: { native: "اردو", english: "Urdu" },
  sa: { native: "संस्कृतम्", english: "Sanskrit" },
  mai: { native: "मैथिली", english: "Maithili" },
  sat: { native: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali" },
  ks: { native: "कॉशुर / كأشُر", english: "Kashmiri" },
  ne: { native: "नेपाली", english: "Nepali" },
  kok: { native: "कोंकणी", english: "Konkani" },
  sd: { native: "سنڌي / सिंधी", english: "Sindhi" },
  doi: { native: "डोगरी", english: "Dogri" },
  brx: { native: "बडो", english: "Bodo" },
  mni: { native: "মৈতৈলোন্ / ꯃꯩꯇꯩꯂꯣꯟ", english: "Manipuri" }
}

export interface UserLanguageContext {
  role?: string
  isManualLanguage?: boolean
  preferredLanguage?: string
  language?: string
}

export interface FarmerProfileContext {
  state?: string
}

/**
 * Core Business Rule Engine for Language Preference:
 * 1. MANUAL USER SELECTION HAS HIGHEST PRIORITY. If user manually set language -> USE IT.
 * 2. AUTOMATIC REGIONAL LANGUAGE: If user is FARMER with state -> Map state to regional language.
 * 3. FALLBACK: English ('en') for Workers, Admins, or unknown states.
 */
export function resolveUserEffectiveLanguage(
  user?: UserLanguageContext | null,
  farmerProfile?: FarmerProfileContext | null
): string {
  if (!user) return 'en'

  // 1. Manual user selection ALWAYS overrides state
  if (user.isManualLanguage && (user.preferredLanguage || user.language)) {
    return user.preferredLanguage || user.language || 'en'
  }

  // 2. State-based automatic regional language for Farmers
  if (user.role === 'FARMER' && farmerProfile?.state) {
    const rawState = farmerProfile.state.trim()
    const mappedLang = STATE_TO_LANGUAGE[rawState]
    if (mappedLang) {
      return mappedLang
    }
  }

  // 3. Saved user language or default fallback
  return user.language || 'en'
}

export function getLanguageSourceInfo(
  user?: UserLanguageContext | null,
  farmerProfile?: FarmerProfileContext | null
) {
  const effectiveLang = resolveUserEffectiveLanguage(user, farmerProfile)
  const isManual = !!(user?.isManualLanguage && (user?.preferredLanguage || user?.language))
  const stateName = farmerProfile?.state || undefined
  const isDerivedFromState = !isManual && user?.role === 'FARMER' && !!stateName && !!STATE_TO_LANGUAGE[stateName]

  return {
    effectiveLang,
    isManual,
    stateName,
    isDerivedFromState,
    langDetails: LANGUAGE_NAMES[effectiveLang] || { native: effectiveLang, english: effectiveLang }
  }
}
