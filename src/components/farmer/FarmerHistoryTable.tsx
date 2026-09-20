"use client"

import React, { useState } from 'react'
import { ReceiptData, generateReceiptHtml } from '@/lib/receiptTemplate'
import ReceiptModal from '@/components/farmer/ReceiptModal'
import { translateCentre } from '@/lib/translateEntity'

interface FarmerHistoryTableProps {
  historyData: ReceiptData[]
  locale: string
  labels: {
    tokenPass: string
    dateSlot: string
    procurementMandi: string
    status: string
    produceQuantity: string
    action: string
    downloadReceipt: string
    noHistory: string
  }
}

export default function FarmerHistoryTable({ historyData, locale, labels }: FarmerHistoryTableProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenReceipt = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt)
    setIsModalOpen(true)
  }

  const handleDirectPrint = (e: React.MouseEvent, receipt: ReceiptData) => {
    e.stopPropagation()
    const html = generateReceiptHtml(receipt, true)
    const printWindow = window.open('', '_blank', 'width=850,height=1000')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    } else {
      setSelectedReceipt(receipt)
      setIsModalOpen(true)
    }
  }

  if (historyData.length === 0) {
    return <p className="text-center text-sm text-slate-500 py-8">{labels.noHistory}</p>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
            <tr>
              <th className="p-3">{labels.tokenPass}</th>
              <th className="p-3">{labels.dateSlot}</th>
              <th className="p-3">{labels.procurementMandi}</th>
              <th className="p-3">{labels.status}</th>
              <th className="p-3">{labels.produceQuantity}</th>
              <th className="p-3">{labels.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historyData.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900">{h.tokenNumber}</td>
                <td className="p-3 font-medium text-slate-700">{h.date} ({h.timeSlot})</td>
                <td className="p-3">{translateCentre(h.centreName, locale)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      h.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {h.status}
                  </span>
                </td>
                <td className="p-3 font-bold text-slate-800">{h.quantity} Qtl</td>
                <td className="p-3">
                  <div className="inline-flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenReceipt(h)}
                      className="text-xs font-bold text-green-800 hover:text-green-950 hover:underline inline-flex items-center cursor-pointer transition-all"
                      title="View & Download Official Receipt"
                    >
                      <span>{labels.downloadReceipt}</span>
                    </button>
                    <button
                      onClick={(e) => handleDirectPrint(e, h)}
                      className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      title="Direct Print Receipt"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Official Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
