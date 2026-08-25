"use client"

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  bookingSummary?: {
    crop: string
    centreName: string
    centreId: string
    slotId: string
    date: string
    timeSlot: string
  }
}

export default function VoiceAssistant() {
  const pathname = usePathname()
  const locale = pathname ? pathname.split('/')[1] || 'en' : 'en'

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: locale === 'hi'
        ? "नमस्ते! मैं आपका किसान पोर्टल वॉइस असिस्टेंट हूँ। आप मुझसे स्लॉट बुकिंग, कतार स्थिति, मंडी केंद्र या एमएसपी दरें पूछ सकते हैं।"
        : locale === 'bn'
        ? "নমস্কার! আমি আপনার কিষাণ পোর্টাল ভয়েস সহকারী। আপনি স্লট বুকিং, টোকেন স্ট্যাটাস বা এমএসপি দর জানতে চাইতে পারেন।"
        : "Namaste! I am your Kisan Portal Voice Assistant. Ask me about slot bookings, live queue status, Mandi centres, or MSP rates."
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  // Check Web Speech API Support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSpeechSupported(false)
      }
    }
  }, [])

  // Web Speech Synthesis (TTS)
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set speech language code based on locale
    const langMap: Record<string, string> = {
      hi: 'hi-IN', bn: 'bn-IN', pa: 'pa-IN', ta: 'ta-IN', te: 'te-IN',
      mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', ur: 'ur-IN', en: 'en-IN'
    }
    utterance.lang = langMap[locale] || 'en-IN'
    
    utterance.onstart = () => setStatus('speaking')
    utterance.onend = () => setStatus('idle')
    utterance.onerror = () => setStatus('idle')
    
    window.speechSynthesis.speak(utterance)
  }

  // Toggle Speech Recognition (STT)
  const startListening = () => {
    setErrorMessage(null)
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSpeechSupported(false)
      setErrorMessage("Speech recognition is not supported in your browser. Please type your request.")
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = false
      recognition.interimResults = false

      const langMap: Record<string, string> = {
        hi: 'hi-IN', bn: 'bn-IN', pa: 'pa-IN', ta: 'ta-IN', te: 'te-IN',
        mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', ur: 'ur-IN', en: 'en-IN'
      }
      recognition.lang = langMap[locale] || 'en-IN'

      recognition.onstart = () => {
        setStatus('listening')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setStatus('processing')
        handleSendMessage(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setStatus('idle')
        if (event.error === 'not-allowed') {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions or type below.")
        } else if (event.error !== 'no-speech') {
          setErrorMessage("Voice recognition error. Please try typing your request.")
        }
      }

      recognition.onend = () => {
        if (status === 'listening') setStatus('idle')
      }

      recognition.start()
    } catch (err) {
      console.error("STT exception:", err)
      setStatus('idle')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setStatus('idle')
  }

  // Submit User Message to /api/assistant
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery
    if (!query || query.trim().length === 0) return

    setInputQuery('')
    setErrorMessage(null)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setStatus('processing')

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          locale
        })
      })

      if (!res.ok) throw new Error("Assistant API server error")

      const data = await res.json()
      const assistantText = data.text || "I have received your request."

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        bookingSummary: data.bookingSummary
      }

      setMessages(prev => [...prev, assistantMsg])
      speakText(assistantText)
    } catch (err) {
      console.error("Error communicating with assistant:", err)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the assistant. Please try typing or selecting options directly."
      }
      setMessages(prev => [...prev, errorMsg])
      setStatus('error')
    }
  }

  // Execute Explicit Booking Action upon user confirmation
  const handleConfirmBooking = async (summary: NonNullable<Message['bookingSummary']>) => {
    setBookingLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: `CONFIRM_BOOKING:${summary.slotId}:${summary.centreId}:${summary.date}` }
          ],
          locale
        })
      })
      
      const confirmText = locale === 'hi'
        ? `✅ आपकी बुकिंग सफलतापूर्वक हो गई है! आपका टोकन नंबर जनरेट हो गया है। विवरण डैशबोर्ड पर उपलब्ध हैं।`
        : `✅ Your procurement slot has been booked successfully! Token pass generated. View details on your dashboard.`

      const confirmMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: confirmText
      }

      setMessages(prev => [...prev, confirmMsg])
      speakText(confirmText)
    } catch (err) {
      console.error("Booking error:", err)
    }
    setBookingLoading(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-green-950 font-black px-5 py-3.5 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white hover:scale-105 active:scale-95 transition-all group"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🎤</span>
          <span className="text-xs tracking-tight uppercase">
            {locale === 'hi' ? 'AI सहायता सह-पायलट' : locale === 'bn' ? 'AI ভয়েস সহকারী' : 'AI Voice Assistant'}
          </span>
          <span className="w-2.5 h-2.5 bg-green-900 rounded-full animate-ping"></span>
        </button>
      )}

      {/* Expandable Assistant Drawer Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-yellow-400/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-green-950 via-green-900 to-green-950 p-3.5 border-b border-green-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 text-green-950 flex items-center justify-center font-black text-sm">
                🌾
              </div>
              <div>
                <h3 className="font-black text-sm text-white tracking-tight">Kisan Voice Co-Pilot</h3>
                <p className="text-[10px] text-green-300">Govt Procurement Assistant • {locale.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsMuted(!isMuted)
                  if (!isMuted && typeof window !== 'undefined') window.speechSynthesis.cancel()
                }}
                className="p-1.5 rounded-lg bg-green-900/60 hover:bg-green-800 text-xs text-yellow-300"
                title={isMuted ? "Unmute Speech" : "Mute Speech"}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  if (typeof window !== 'undefined') window.speechSynthesis.cancel()
                }}
                className="p-1.5 rounded-lg bg-green-900/60 hover:bg-red-600 text-xs text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Chat Feed */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-950/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-yellow-500 text-green-950 font-bold rounded-br-none shadow'
                      : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none shadow'
                  }`}
                >
                  {m.content}
                </div>

                {/* Explicit Booking Summary Confirmation Card */}
                {m.bookingSummary && (
                  <div className="mt-2 p-3 bg-slate-900 border-2 border-yellow-400 rounded-xl text-xs space-y-2 max-w-[90%] shadow-lg">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="font-bold text-yellow-400 uppercase text-[10px]">Booking Summary</span>
                      <span className="text-[10px] text-green-300">Verify Details</span>
                    </div>
                    <div className="space-y-1 text-slate-200">
                      <p>Crop: <strong className="text-white">{m.bookingSummary.crop}</strong></p>
                      <p>Mandi: <strong className="text-white">{m.bookingSummary.centreName}</strong></p>
                      <p>Date: <strong className="text-white">{m.bookingSummary.date}</strong></p>
                      <p>Time Slot: <strong className="text-white">{m.bookingSummary.timeSlot}</strong></p>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Button
                        size="sm"
                        disabled={bookingLoading}
                        onClick={() => handleConfirmBooking(m.bookingSummary!)}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black text-xs h-7"
                      >
                        {bookingLoading ? "Booking..." : "✅ Confirm Booking"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {status === 'processing' && (
              <div className="flex items-center space-x-2 text-xs text-yellow-400 italic">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                <span>Processing request...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Status Alert Banner */}
          {errorMessage && (
            <div className="bg-red-950/80 border-t border-red-800 p-2 text-[11px] text-red-300 text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Controls Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            {/* Voice Microphone Bar */}
            <div className="flex justify-center">
              {status === 'listening' ? (
                <Button
                  onClick={stopListening}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2 rounded-full animate-pulse flex items-center space-x-2 shadow-lg"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                  <span>Listening... Tap to Stop</span>
                </Button>
              ) : (
                <Button
                  onClick={startListening}
                  disabled={status === 'processing'}
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-green-950 font-black text-xs px-6 py-2 rounded-full flex items-center space-x-2 shadow-md"
                >
                  <span>🎤</span>
                  <span>{locale === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to Speak'}</span>
                </Button>
              )}
            </div>

            {/* Fallback Text Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex gap-2 pt-1"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={locale === 'hi' ? 'या अपना प्रश्न यहाँ लिखें...' : 'Or type your request...'}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
              <Button
                type="submit"
                disabled={!inputQuery.trim() || status === 'processing'}
                className="bg-green-800 hover:bg-green-700 text-white font-bold px-3 text-xs"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
