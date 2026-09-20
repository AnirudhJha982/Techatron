import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  handleGetFarmerProfile,
  handleSearchCentres,
  handleGetAvailableSlots,
  handleBookSlot,
  handleGetQueueStatus,
  handleGetProcurementStatus,
  handleGetPaymentStatus,
  handleGetNotifications,
  handleGetMSPInformation,
  handleCreateGrievance,
  GEMINI_TOOLS_SCHEMA
} from '@/lib/assistantTools'

const SYSTEM_PROMPT = `You are Mandi Marg's official agricultural procurement assistant.
Your purpose is to help farmers interact with Mandi Marg using natural spoken language or text.

Capabilities:
- Procurement slot booking (Wheat, Paddy, Mustard, Chana)
- Searching nearby Mandi procurement centres by district or state
- Checking live token status, queue position, and wait times
- Checking crop weighment, moisture %, quality grade, and procurement records
- Checking Direct Benefit Transfer (DBT) bank credit payment status
- Checking official government MSP rates
- Raising grievance complaints
- Checking notifications

Strict Security & Data Rules:
1. Always use real application data from tools.
2. NEVER invent token numbers, slot availability, queue positions, payment amounts, or centre names.
3. For data modification (Slot Booking, Raising Grievances):
   a. Collect Crop, Centre, Date, and Time Slot.
   b. Ask for explicit user confirmation ("Should I confirm this booking?").
   c. Do NOT execute bookProcurementSlot unless the user explicitly confirms with "Yes", "Confirm", "Book it", etc.
4. Keep responses concise, clear, polite, and easy for farmers to understand.
5. Use the user's selected language (Hindi, English, Bengali, etc.).`

export async function POST(req: Request) {
  try {
    const session = await auth()
    const { messages, locale = 'en' } = await req.json()

    const userId = session?.user?.id || ""
    const apiKey = process.env.GEMINI_API_KEY

    const userMessageText = messages[messages.length - 1]?.content || ""

    // Handle Gemini API Call
    if (apiKey && apiKey.trim().length > 0) {
      const geminiResponse = await callGeminiAPI(messages, locale, userId, apiKey)
      return NextResponse.json(geminiResponse)
    }

    // Smart Server-Side Fallback Handler (When GEMINI_API_KEY is pending)
    const fallbackResponse = await handleRuleBasedAssistant(userMessageText, locale, userId)
    return NextResponse.json(fallbackResponse)

  } catch (err: any) {
    console.error("Error in /api/assistant:", err)
    return NextResponse.json({
      text: "I am having trouble processing your request right now. Please try again or use the portal buttons directly."
    }, { status: 500 })
  }
}

async function callGeminiAPI(messages: any[], locale: string, userId: string, apiKey: string) {
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }))

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\nCurrent Locale: ${locale}` }] },
    tools: GEMINI_TOOLS_SCHEMA
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("Gemini API error:", errText)
    return await handleRuleBasedAssistant(messages[messages.length - 1]?.content || "", locale, userId)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]
  const firstPart = candidate?.content?.parts?.[0]

  if (firstPart?.functionCall) {
    const call = firstPart.functionCall
    const toolName = call.name
    const args = call.args || {}

    let toolResult: any = null
    if (toolName === 'getFarmerProfile') toolResult = await handleGetFarmerProfile(userId)
    else if (toolName === 'searchProcurementCentres') toolResult = await handleSearchCentres(args.query)
    else if (toolName === 'getAvailableSlots') toolResult = await handleGetAvailableSlots(args.centreId, args.dateStr)
    else if (toolName === 'bookProcurementSlot') toolResult = await handleBookSlot(args.slotId, args.centreId, args.dateStr)
    else if (toolName === 'getQueueStatus') toolResult = await handleGetQueueStatus(userId)
    else if (toolName === 'getProcurementStatus') toolResult = await handleGetProcurementStatus(userId)
    else if (toolName === 'getPaymentStatus') toolResult = await handleGetPaymentStatus(userId)
    else if (toolName === 'getNotifications') toolResult = await handleGetNotifications(userId)
    else if (toolName === 'getMSPInformation') toolResult = await handleGetMSPInformation()
    else if (toolName === 'createGrievance') toolResult = await handleCreateGrievance(args.category, args.description)

    // Second turn to Gemini with functionResponse
    const secondPayload = {
      contents: [
        ...contents,
        { role: 'model', parts: [{ functionCall: call }] },
        { role: 'function', parts: [{ functionResponse: { name: toolName, response: { result: toolResult } } }] }
      ],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
    }

    const secondRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(secondPayload)
    })

    if (secondRes.ok) {
      const secondData = await secondRes.json()
      const text = secondData.candidates?.[0]?.content?.parts?.[0]?.text || "Task completed."
      return { text, toolResult }
    }
  }

  return { text: firstPart?.text || "Namaste! How can I assist you with Mandi Marg today?" }
}

function parseRequestedDate(input: string): { dateStr: string; hasExplicitDate: boolean } {
  // Normalize Bengali numerals to standard ASCII digits
  const normalizedInput = input.replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString())
  const text = normalizedInput.toLowerCase()

  // 1. Check relative date keywords (English, Hindi, Bengali)
  const today = new Date()
  if (text.includes('today') || text.includes('आज') || text.includes('আজ')) {
    return { dateStr: today.toISOString().split('T')[0], hasExplicitDate: true }
  }
  if (text.includes('tomorrow') || text.includes('कल') || text.includes('আগামীকাল') || text.includes('কাল')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { dateStr: tomorrow.toISOString().split('T')[0], hasExplicitDate: true }
  }

  // 2. Check YYYY-MM-DD
  const isoMatch = text.match(/\b(20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/)
  if (isoMatch) return { dateStr: isoMatch[0], hasExplicitDate: true }

  // 3. Check DD Month YYYY or DD Month
  const monthMap: Record<string, string> = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
    apr: '04', april: '04', may: '05', june: '06', jun: '06', jul: '07', july: '07',
    aug: '08', august: '08', sep: '09', september: '09', oct: '10', october: '10',
    nov: '11', november: '11', dec: '12', december: '12',
    'জানুয়ারি': '01', 'ফেব্রুয়ারি': '02', 'মার্চ': '03', 'এপ্রিল': '04', 'মে': '05',
    'জুন': '06', 'জুলাই': '07', 'আগস্ট': '08', 'সেপ্টেম্বর': '09', 'অক্টোবর': '10',
    'নভেম্বর': '11', 'ডিসেম্বর': '12'
  }

  const dateMatch = text.match(/(\d{1,2})\s+([a-z\u0980-\u09FF]+)\s*(\d{4})?/)
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0')
    const monthStr = dateMatch[2]
    const year = dateMatch[3] || '2026'
    if (monthMap[monthStr]) {
      return { dateStr: `${year}-${monthMap[monthStr]}-${day}`, hasExplicitDate: true }
    }
  }

  // Fallback to today
  return { dateStr: today.toISOString().split('T')[0], hasExplicitDate: false }
}

async function handleRuleBasedAssistant(input: string, locale: string, userId: string) {
  const text = input.toLowerCase()

  // Explicit Confirm Booking Trigger
  if (input.startsWith('CONFIRM_BOOKING:')) {
    const parts = input.split(':')
    const slotId = parts[1]
    const centreId = parts[2]
    const dateStr = parts[3]

    try {
      const res = await handleBookSlot(slotId, centreId, dateStr)
      return {
        text: locale === 'hi'
          ? `✅ बुकिंग सफल! आपका टोकन नंबर ${res.tokenNumber} जनरेट हो गया है।`
          : locale === 'bn'
          ? `✅ বুকিং সফল! আপনার টোকেন নম্বর ${res.tokenNumber} তৈরি করা হয়েছে।`
          : `✅ Booking successful! Token ${res.tokenNumber} confirmed for ${dateStr}.`,
        bookingCompleted: true
      }
    } catch (err: any) {
      return {
        text: locale === 'hi'
          ? `बुकिंग विफल: ${err.message || 'कृपया पहले अपनी प्रोफ़ाइल पर सत्यापन पूरा करें।'}`
          : locale === 'bn'
          ? `বুকিং ব্যর্থ হয়েছে: ${err.message || 'অনুগ্রহ করে প্রথমে আপনার প্রোফাইলে কৃষক যাচাইকরণ সম্পন্ন করুন।'}`
          : `Booking failed: ${err.message || 'Please complete farmer verification on your profile first.'}`
      }
    }
  }

  // MSP Intent
  if (text.includes('msp') || text.includes('rate') || text.includes('price') || text.includes('भाव') || text.includes('दाम') || text.includes('दर') || text.includes('দাম') || text.includes('মূল্য') || text.includes('দর')) {
    const msp = await handleGetMSPInformation()
    const isHi = locale === 'hi'
    const isBn = locale === 'bn'
    let msg = isHi
      ? "सरकारी एमएसपी दरें: गेहूं (शरबती): ₹ 2,275/क्विंटल, गेहूं (सामान्य): ₹ 2,125/क्विंटल, धान: ₹ 2,183/क्विंटल, सरसों: ₹ 5,650/क्विंटल।"
      : isBn
      ? "সরকারি এমএসপি দর: গম (শরবতী): ₹ ২,২৭৫/কুইন্টাল, গম (সাধারণ): ₹ ২,১২৫/কুইন্টাল, ধান: ₹ ২,১৮৩/কুইন্টাল, সরিষা: ₹ ৫,৬৫০/কুইন্টাল।"
      : "Government MSP Rates: Wheat (Sharbati): ₹ 2,275/Qtl, Wheat (Standard): ₹ 2,125/Qtl, Paddy: ₹ 2,183/Qtl, Mustard: ₹ 5,650/Qtl, Chana: ₹ 5,440/Qtl."
    return { text: msg, data: msp }
  }

  // Queue / Token Intent
  if (text.includes('queue') || text.includes('token') || text.includes('position') || text.includes('कतार') || text.includes('टोकन') || text.includes('সারি')) {
    const queue = await handleGetQueueStatus(userId)
    if (!queue.hasBooking) {
      return {
        text: locale === 'hi'
          ? "वर्तमान में आपका कोई सक्रिय कतार टोकन नहीं है। आप एक खरीद स्लॉट बुक कर सकते हैं।"
          : locale === 'bn'
          ? "বর্তমানে আপনার কোনো সক্রিয় টোকেন নেই। আপনি একটি স্লট বুক করতে পারেন।"
          : "You currently have no active queue token. Would you like to book a slot?"
      }
    }
    return {
      text: locale === 'hi'
        ? `आपका टोकन नंबर ${queue.tokenNumber} है। कतार में आपकी स्थिति #${queue.queuePosition} है।`
        : locale === 'bn'
        ? `আপনার টোকেন নম্বর ${queue.tokenNumber}। সারিতে আপনার অবস্থান #${queue.queuePosition}।`
        : `Your active token is ${queue.tokenNumber}. You are #${queue.queuePosition} in queue.`
    }
  }

  // Payment Intent
  if (text.includes('payment') || text.includes('dbt') || text.includes('money') || text.includes('भुगतान') || text.includes('पैसा') || text.includes('টাকা') || text.includes('পেমেন্ট')) {
    const pay = await handleGetPaymentStatus(userId)
    return {
      text: locale === 'hi'
        ? `आपके आधार लिंक खाते में प्राप्त कुल डीबीटी: ${pay.totalReceived}।`
        : locale === 'bn'
        ? `আপনার আধার যুক্ত ব্যাঙ্ক অ্যাকাউন্টে প্রাপ্ত মোট DBT: ${pay.totalReceived}।`
        : `Total DBT payment received in your Aadhaar linked bank account: ${pay.totalReceived}.`
    }
  }

  // Centre Search Intent
  if (text.includes('centre') || text.includes('mandi') || text.includes('केंद्र') || text.includes('मंडी') || text.includes('কেন্দ্র') || text.includes('মান্ডি')) {
    const centres = await handleSearchCentres()
    const centreNames = centres.slice(0, 3).map(c => `${c.name} (${c.district})`).join(', ')
    return {
      text: locale === 'hi'
        ? `सक्रिय मंडी केंद्र: ${centreNames}।`
        : locale === 'bn'
        ? `সক্রিয় মান্ডি কেন্দ্রসমূহ: ${centreNames}।`
        : `Active Mandi procurement centres found: ${centreNames}.`
    }
  }

  // Booking Intent
  if (text.includes('book') || text.includes('slot') || text.includes('बुक') || text.includes('स्लॉट') || text.includes('স্লট') || text.includes('বুক')) {
    const { dateStr, hasExplicitDate } = parseRequestedDate(input)
    const centres = await handleSearchCentres()
    const targetCentre = centres[0]
    const slots = await handleGetAvailableSlots(targetCentre.id, dateStr)
    const availableSlots = slots.filter((s: any) => s.available > 0)

    if (availableSlots.length === 0) {
      return {
        text: locale === 'hi'
          ? `क्षमा करें, ${dateStr} के लिए ${targetCentre.name} पर कोई स्लॉट उपलब्ध नहीं है। कृपया कोई अन्य तिथि चुनें।`
          : locale === 'bn'
          ? `দুঃখিত, ${dateStr} তারিখে ${targetCentre.name}-এ কোনো স্লট খালি নেই। অনুগ্রহ করে অন্য তারিখ নির্বাচন করুন।`
          : `Sorry, there are no available slots at ${targetCentre.name} on ${dateStr}. Please select another date.`
      }
    }

    const targetSlot = availableSlots[0]

    return {
      text: locale === 'hi'
        ? `मुझे ${targetCentre.name} पर ${dateStr} के लिए (${targetSlot.timeSlot}) स्लॉट मिला है। क्या आप इसकी पुष्टि करना चाहते हैं?`
        : locale === 'bn'
        ? `আমি ${targetCentre.name}-এ ${dateStr} তারিখের জন্য (${targetSlot.timeSlot}) স্লট পেয়েছি। আপনি কি এটি নিশ্চিত করতে চান?`
        : `I found an available slot at ${targetCentre.name} for ${dateStr} (${targetSlot.timeSlot}). Would you like me to confirm this booking?`,
      confirmationRequired: true,
      bookingSummary: {
        crop: "Wheat (Sharbati Grade A)",
        centreName: targetCentre.name,
        centreId: targetCentre.id,
        slotId: targetSlot.id,
        date: dateStr,
        timeSlot: targetSlot.timeSlot
      }
    }
  }

  // Default Greeting / Guide
  return {
    text: locale === 'hi'
      ? "नमस्ते! मैं आपका किसान पोर्टल वॉइस असिस्टेंट हूँ। आप मुझसे स्लॉट बुकिंग, टोकन स्थिति, मंडी केंद्र, एमएसपी दरें और भुगतान की स्थिति पूछ सकते हैं।"
      : locale === 'bn'
      ? "নমস্কার! আমি আপনার কিষাণ পোর্টাল ভয়েস সহকারী। আপনি স্লট বুকিং, টোকেন স্ট্যাটাস বা এমএসপি দর জানতে চাইতে পারেন।"
      : "Namaste! I am your Mandi Marg Voice Assistant. Ask me about slot bookings, live queue tokens, Mandi centres, MSP rates, or DBT payments."
  }
}
