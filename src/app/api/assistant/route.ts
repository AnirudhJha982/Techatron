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

async function handleRuleBasedAssistant(input: string, locale: string, userId: string) {
  const text = input.toLowerCase()

  // MSP Intent
  if (text.includes('msp') || text.includes('rate') || text.includes('price') || text.includes('भाव') || text.includes('दाम')) {
    const msp = await handleGetMSPInformation()
    const isHi = locale === 'hi'
    const isBn = locale === 'bn'
    let msg = isHi
      ? "सरकारी एमएसपी दरें: गेहूं (शरबती): ₹ 2,275/क्विंटल, गेहूं (सामान्य): ₹ 2,125/क्विंटल, धान: ₹ 2,183/क्विंटल, सरसों: ₹ 5,650/क्विंटल।"
      : isBn
      ? "সরকারি এমএসপি দর: গম (শরবতী): ₹ ২,২৭৫/কুইন্টাল, ধান: ₹ ২,১৮৩/কুইন্টাল, সরিষা: ₹ ৫,৬৫০/কুইন্টাল।"
      : "Government MSP Rates: Wheat (Sharbati): ₹ 2,275/Qtl, Wheat (Standard): ₹ 2,125/Qtl, Paddy: ₹ 2,183/Qtl, Mustard: ₹ 5,650/Qtl, Chana: ₹ 5,440/Qtl."
    return { text: msg, data: msp }
  }

  // Queue / Token Intent
  if (text.includes('queue') || text.includes('token') || text.includes('position') || text.includes('कतार') || text.includes('टोकन')) {
    const queue = await handleGetQueueStatus(userId)
    if (!queue.hasBooking) {
      return { text: locale === 'hi' ? "वर्तमान में आपका कोई सक्रिय कतार टोकन नहीं है। आप एक खरीद स्लॉट बुक कर सकते हैं।" : "You currently have no active queue token. Would you like to book a slot?" }
    }
    return { text: locale === 'hi' ? `आपका टोकन नंबर ${queue.tokenNumber} है। कतार में आपकी स्थिति #${queue.queuePosition} है।` : `Your active token is ${queue.tokenNumber}. You are #${queue.queuePosition} in queue.` }
  }

  // Payment Intent
  if (text.includes('payment') || text.includes('dbt') || text.includes('money') || text.includes('भुगतान') || text.includes('पैसा')) {
    const pay = await handleGetPaymentStatus(userId)
    return { text: locale === 'hi' ? `आपके आधार लिंक खाते में प्राप्त कुल डीबीटी: ${pay.totalReceived}।` : `Total DBT payment received in your Aadhaar linked bank account: ${pay.totalReceived}.` }
  }

  // Centre Search Intent
  if (text.includes('centre') || text.includes('mandi') || text.includes('केंद्र') || text.includes('मंडी')) {
    const centres = await handleSearchCentres()
    const centreNames = centres.slice(0, 3).map(c => `${c.name} (${c.district})`).join(', ')
    return { text: locale === 'hi' ? `सक्रिय मंडी केंद्र: ${centreNames}।` : `Active Mandi procurement centres found: ${centreNames}.` }
  }

  // Booking Intent
  if (text.includes('book') || text.includes('slot') || text.includes('बुक') || text.includes('स्लॉट')) {
    const centres = await handleSearchCentres()
    const targetCentre = centres[0]
    const today = new Date().toISOString().split('T')[0]
    const slots = await handleGetAvailableSlots(targetCentre.id, today)
    const targetSlot = slots[0]

    return {
      text: locale === 'hi'
        ? `मुझे ${targetCentre.name} पर ${today} के लिए (${targetSlot.timeSlot}) स्लॉट मिला है। क्या आप इसकी पुष्टि करना चाहते हैं?`
        : `I found an available slot at ${targetCentre.name} for ${today} (${targetSlot.timeSlot}). Would you like me to confirm this booking?`,
      confirmationRequired: true,
      bookingSummary: {
        crop: "Wheat (Sharbati Grade A)",
        centreName: targetCentre.name,
        centreId: targetCentre.id,
        slotId: targetSlot.id,
        date: today,
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
