"use client"

import { saveUserLanguagePreferenceAction } from "@/app/actions/languageActions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

interface ProfileLanguageSettingsProps {
  currentLocale: string
  isManual: boolean
  isDerivedFromState: boolean
  stateName?: string
  effectiveLangName: string
}

export default function ProfileLanguageSettings({
  currentLocale,
  isManual,
  isDerivedFromState,
  stateName,
  effectiveLangName
}: ProfileLanguageSettingsProps) {
  const pathname = usePathname()

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value
    if (nextLocale === currentLocale) return

    await saveUserLanguagePreferenceAction(nextLocale)

    const validCodes = LANGUAGES.map(l => l.code)
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
    <Card className="bg-white shadow-sm border-slate-200">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span>🌐</span>
          <span>Language Preference & Localization</span>
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Set your preferred portal interface language.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Portal Language</label>
          <select
            value={currentLocale}
            onChange={handleLanguageChange}
            className="w-full max-w-md bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 font-bold text-sm focus:border-yellow-400 focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Informational Status Banner */}
        {isManual ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 font-medium flex items-center space-x-2">
            <span>✅</span>
            <span>Your language preference has been saved.</span>
          </div>
        ) : isDerivedFromState ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium flex items-center space-x-2">
            <span>📍</span>
            <span>
              Language selected automatically based on your state: <strong>{stateName}</strong> (<strong>{effectiveLangName}</strong>).
            </span>
          </div>
        ) : (
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Default language (English). Select your regional language above to save your preference.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
