"use client"

import { usePathname } from "next/navigation"

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "as", name: "অসমীয়া (Assamese)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "ur", name: "اردو (Urdu)" },
  { code: "sa", name: "संस्कृतम् (Sanskrit)" },
  { code: "mai", name: "मैथिली (Maithili)" },
  { code: "sat", name: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)" },
  { code: "ks", name: "कॉशुर / كأشُر (Kashmiri)" },
  { code: "ne", name: "नेपाली (Nepali)" },
  { code: "kok", name: "कोंकणी (Konkani)" },
  { code: "sd", name: "سنڌي / सिंधी (Sindhi)" },
  { code: "doi", name: "डोगरी (Dogri)" },
  { code: "brx", name: "बडो (Bodo)" },
  { code: "mni", name: "মৈতৈলোন্ / ꯃꯩꯇꯩꯂꯣꯟ (Manipuri)" }
]

export default function LanguageSwitcher() {
  const pathname = usePathname()

  // Current locale detection
  const segments = pathname.split('/')
  const validCodes = LANGUAGES.map(l => l.code)
  const currentLocale = validCodes.includes(segments[1]) ? segments[1] : 'en'

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value
    const pathSegments = pathname.split('/')
    
    if (validCodes.includes(pathSegments[1])) {
      pathSegments[1] = nextLocale
    } else {
      pathSegments.splice(1, 0, nextLocale)
    }

    const newPath = pathSegments.join('/') || `/${nextLocale}`
    window.location.href = newPath
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-green-100 hidden sm:inline">🌐</span>
      <select
        value={currentLocale}
        onChange={handleLanguageChange}
        className="bg-green-950/80 text-white border border-green-600/60 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold cursor-pointer shadow-sm hover:bg-green-900 transition-colors"
        aria-label="Select Language"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-white py-1">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}
