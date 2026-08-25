"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCentres, getSlots, createBooking } from '@/app/actions/booking'
import { translateCentre, translateState } from '@/lib/translateEntity'
import Link from 'next/link'

export default function BookingWizardPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const t = useTranslations('Booking')
  const tCrops = useTranslations('Crops')

  const CROPS = [
    { key: 'wheatSharbati', name: tCrops('wheatSharbati'), msp: "₹ 2,275 / Qtl", icon: "🌾" },
    { key: 'wheatStandard', name: tCrops('wheatStandard'), msp: "₹ 2,125 / Qtl", icon: "🌾" },
    { key: 'paddyCommon', name: tCrops('paddyCommon'), msp: "₹ 2,183 / Qtl", icon: "🌱" },
    { key: 'paddyGradeA', name: tCrops('paddyGradeA'), msp: "₹ 2,203 / Qtl", icon: "🌱" },
    { key: 'mustard', name: tCrops('mustard'), msp: "₹ 5,650 / Qtl", icon: "🌼" },
    { key: 'chana', name: tCrops('chana'), msp: "₹ 5,440 / Qtl", icon: "🫘" }
  ]

  const [step, setStep] = useState(1)
  const [selectedCrop, setSelectedCrop] = useState<any>(CROPS[0])
  const [centres, setCentres] = useState<any[]>([])
  const [selectedCentre, setSelectedCentre] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCentres().then(data => {
      if (Array.isArray(data)) {
        setCentres(data)
        if (data.length > 0) setSelectedCentre(data[0])
      }
    }).catch(err => {
      console.error("Error loading centres:", err)
    })
  }, [])

  useEffect(() => {
    if (selectedCentre && selectedDate) {
      setLoading(true)
      getSlots(selectedCentre.id, selectedDate).then(fetchedSlots => {
        if (Array.isArray(fetchedSlots)) {
          setSlots(fetchedSlots)
          if (fetchedSlots.length > 0) setSelectedSlot(fetchedSlots[0])
        }
        setLoading(false)
      }).catch(err => {
        console.error("Error loading slots:", err)
        setSlots([])
        setLoading(false)
      })
    }
  }, [selectedCentre, selectedDate])

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedCentre || !selectedDate) return
    setLoading(true)
    try {
      const res = await createBooking(selectedSlot.id, selectedCentre.id, selectedDate)
      setBookingResult(res)
      setStep(5)
    } catch (err: any) {
      alert(err?.message || "Failed to create booking. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
      </div>

      {/* Stepper Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {[
          { step: 1, label: t('step1') },
          { step: 2, label: t('step2') },
          { step: 3, label: t('step3') },
          { step: 4, label: t('step4') },
          { step: 5, label: t('step5') }
        ].map((s) => (
          <div key={s.step} className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
              step >= s.step ? 'bg-green-800 text-yellow-400 shadow-md' : 'bg-slate-200 text-slate-500'
            }`}>
              {s.step}
            </div>
            <span className="text-xs font-semibold mt-1.5 text-slate-600 hidden sm:block">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent className="pt-6">
          {/* STEP 1: CHOOSE CROP */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t('step1Title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CROPS.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCrop(c)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCrop?.key === c.key ? 'border-green-700 bg-green-50/70 ring-2 ring-green-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{c.icon}</div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-xs text-green-700 font-extrabold mt-1">MSP: {c.msp}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-green-800 hover:bg-green-700 text-white font-bold px-8">
                  {t('nextCentre')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE CENTRE */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t('step2Title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centres.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCentre(c)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCentre?.id === c.id ? 'border-green-700 bg-green-50/70 ring-2 ring-green-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] bg-yellow-400 text-green-950 font-bold px-2 py-0.5 rounded uppercase">{translateState(c.state, locale)}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{translateCentre(c.name, locale)}</h3>
                    <p className="text-xs text-slate-500 mt-1">{c.address}</p>
                    <p className="text-xs font-semibold text-green-800 mt-3">Capacity: {c.capacityPerDay} Qtl / Day</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>{t('back')}</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedCentre} className="bg-green-800 hover:bg-green-700 text-white font-bold px-8">
                  {t('nextDateTime')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE & TIME SLOT */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t('step3Title')}</h2>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{t('selectDate')}</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none w-full sm:w-64"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{t('availableSlots')} {selectedDate}</label>
                {loading ? (
                  <p className="text-sm text-slate-500 py-4">{t('checkingSlots')}</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-red-600 font-semibold py-4">{t('noSlots')}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {slots.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => s.available > 0 && setSelectedSlot(s)}
                        className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${
                          s.available <= 0 ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200' :
                          selectedSlot?.id === s.id ? 'border-green-700 bg-green-50/70 ring-2 ring-green-200' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h4 className="font-bold text-slate-900 text-sm">{s.timeSlot}</h4>
                        <p className="text-xs text-slate-500 mt-1">{t('availableLabel')}: <strong className="text-green-800">{s.available}</strong> / {s.capacity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>{t('back')}</Button>
                <Button onClick={() => setStep(4)} disabled={!selectedSlot} className="bg-green-800 hover:bg-green-700 text-white font-bold px-8">
                  {t('nextReview')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t('step4Title')}</h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{t('selectedCropLabel')}</span>
                  <span className="font-bold text-slate-900">{selectedCrop?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{t('procurementMandiLabel')}</span>
                  <span className="font-bold text-slate-900">{translateCentre(selectedCentre?.name, locale)} ({selectedCentre?.district})</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{t('appointmentDateLabel')}</span>
                  <span className="font-bold text-slate-900">{selectedDate}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{t('timeWindowLabel')}</span>
                  <span className="font-bold text-slate-900">{selectedSlot?.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('expectedMspRate')}</span>
                  <span className="font-black text-green-800">{selectedCrop?.msp}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} disabled={loading}>{t('back')}</Button>
                <Button onClick={handleConfirm} disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black px-8 text-base">
                  {loading ? t('generatingToken') : t('confirmIssueToken')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS & DIGITAL TOKEN PASS */}
          {step === 5 && bookingResult && (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
                ✅
              </div>
              <h2 className="text-3xl font-black text-green-950">{t('step5Title')}</h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto">{t('step5Sub')}</p>

              {/* Digital Token Card */}
              <div className="bg-gradient-to-br from-green-900 via-green-850 to-green-950 text-white p-8 rounded-2xl border-4 border-yellow-400 max-w-md mx-auto shadow-xl text-left relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-yellow-400 text-green-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">Govt Digital Pass</span>
                  <span className="text-xs text-green-200">Ref #{bookingResult._id ? bookingResult._id.slice(-6) : '000000'}</span>
                </div>

                <div className="text-center py-4 border-y border-green-800 my-4">
                  <p className="text-xs uppercase text-green-200 tracking-widest font-semibold">{t('tokenNumberLabel')}</p>
                  <p className="text-5xl font-black text-yellow-400 tracking-tight my-1">{bookingResult.tokenNumber}</p>
                  <p className="text-xs text-green-200">{t('queueEstPos')}: <strong>#{bookingResult.queuePosition}</strong></p>
                </div>

                <div className="space-y-1.5 text-xs text-green-100">
                  <p>Mandi: <strong className="text-white">{translateCentre(selectedCentre?.name, locale)}</strong></p>
                  <p>Date: <strong className="text-white">{selectedDate}</strong></p>
                  <p>Slot Window: <strong className="text-white">{selectedSlot?.timeSlot}</strong></p>
                  <p>Commodity: <strong className="text-white">{selectedCrop?.name}</strong></p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Link href={`/${locale}/farmer/dashboard`}>
                  <Button className="bg-green-800 hover:bg-green-700 text-white font-bold px-8">
                    {t('goToDashboard')}
                  </Button>
                </Link>
                <Link href={`/${locale}/farmer/queue`}>
                  <Button variant="outline" className="border-green-700 text-green-800 font-bold px-6">
                    {t('trackLiveQueue')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
