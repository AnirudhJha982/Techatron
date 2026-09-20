"use client"

import React from 'react'
import { ReceiptData, generateReceiptHtml } from '@/lib/receiptTemplate'
import { Button } from '@/components/ui/button'

export default function ReceiptClientView({ receipt }: { receipt: ReceiptData }) {
  const handlePrint = () => {
    const html = generateReceiptHtml(receipt, true)
    const printWindow = window.open('', '_blank', 'width=850,height=1000')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    } else {
      window.print()
    }
  }

  const handleDownload = () => {
    const html = generateReceiptHtml(receipt, false)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Procurement_Receipt_${receipt.tokenNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-3 no-print">
        <Button onClick={handleDownload} variant="outline" className="font-bold">
          📥 Download Receipt File
        </Button>
        <Button onClick={handlePrint} className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold">
          🖨️ Print / Save as PDF
        </Button>
      </div>

      <div className="bg-white border-2 border-emerald-700 rounded-lg p-6 sm:p-8 shadow-md text-slate-900">
        {/* National Tricolor Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808] rounded mb-5 border border-slate-200"></div>

        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-emerald-800">
          <p className="text-[11px] font-bold text-emerald-800 tracking-widest uppercase">
            Government of India • Ministry of Agriculture & Farmers Welfare
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-tight my-1">
            Mandi Marg E-Procurement Authority
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            National Agricultural Minimum Support Price (MSP) Direct Procurement System
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Form MSP-04 • Official Produce Procurement & Weighbridge Voucher
          </div>
        </div>

        {/* Meta Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-md mb-4 text-xs">
          <div>
            <span className="text-slate-500">Receipt Ref: </span>
            <strong className="text-emerald-900">MM/REC/2026/{receipt.tokenNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500">Token: </span>
            <strong className="text-amber-800 font-bold">{receipt.tokenNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500">Date: </span>
            <strong className="text-slate-800">{receipt.date} ({receipt.timeSlot})</strong>
          </div>
          <div>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-green-200 text-green-900">
              ✓ {receipt.status}
            </span>
          </div>
        </div>

        {/* Grid Particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
          {/* Farmer Info */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-100 font-bold px-3 py-1.5 uppercase text-[10px] text-slate-700 tracking-wider">
              I. Farmer Beneficiary Particulars
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Farmer Name:</span>
                <strong className="text-slate-900">{receipt.farmerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Farmer ID:</span>
                <strong className="text-emerald-800">{receipt.farmerId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Mobile:</span>
                <span className="font-semibold text-slate-800">{receipt.farmerPhone ? `+91 ${receipt.farmerPhone}` : 'Verified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Village / District:</span>
                <span className="font-semibold text-slate-800">{receipt.farmerVillage ? `${receipt.farmerVillage}, ` : ''}{receipt.farmerDistrict || receipt.centreDistrict || 'Central Area'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DBT Bank Account:</span>
                <span className="font-mono font-bold text-slate-900">{receipt.bankAccountMasked}</span>
              </div>
            </div>
          </div>

          {/* Mandi Centre Info */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-100 font-bold px-3 py-1.5 uppercase text-[10px] text-slate-700 tracking-wider">
              II. Procurement Centre & Weighbridge Details
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mandi Centre:</span>
                <strong className="text-slate-900">{receipt.centreName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">APMC Reg Code:</span>
                <span className="font-mono font-semibold text-slate-800">APMC-{(receipt.centreDistrict || 'CENT').toUpperCase().slice(0, 4)}-01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mandi Location:</span>
                <span className="font-semibold text-slate-800">{receipt.centreAddress || 'Main APMC Mandi Yard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scale Inspection:</span>
                <span className="text-emerald-700 font-semibold">Calibrated Pitless Electronic Scale</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Procurement Season:</span>
                <span className="font-semibold text-slate-800">Rabi & Kharif MSP 2025-26</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weighbridge & Crop Assessment Table */}
        <div className="overflow-x-auto mb-4 border border-slate-200 rounded-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-emerald-800 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Commodity / Crop</th>
                <th className="p-2.5">Gross Wt</th>
                <th className="p-2.5">Tare Wt</th>
                <th className="p-2.5">Net Procured</th>
                <th className="p-2.5">Moisture</th>
                <th className="p-2.5">Grade</th>
                <th className="p-2.5">MSP Rate</th>
                <th className="p-2.5 text-right">Total Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-white">
                <td className="p-2.5 font-bold text-slate-900">{receipt.crop}</td>
                <td className="p-2.5 text-slate-600">{(receipt.quantity + 0.45).toFixed(2)} Qtl</td>
                <td className="p-2.5 text-slate-600">0.45 Qtl</td>
                <td className="p-2.5 font-black text-emerald-900">{receipt.quantity.toFixed(2)} Qtl</td>
                <td className="p-2.5">{receipt.moistureLevel}% <span className="text-[9px] text-emerald-700 font-bold">(Pass)</span></td>
                <td className="p-2.5 font-bold text-emerald-700">{receipt.qualityGrade}</td>
                <td className="p-2.5">₹ {receipt.mspRate.toLocaleString('en-IN')}/Qtl</td>
                <td className="p-2.5 text-right font-black text-emerald-800 text-sm">₹ {receipt.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Settlement Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Gross Produce Value ({receipt.quantity.toFixed(2)} Qtl @ ₹ {receipt.mspRate.toLocaleString('en-IN')}/Qtl):</span>
            <span className="font-semibold text-slate-900">₹ {receipt.totalAmount.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Mandi Market Fee & Statutory Cess (Govt Direct Procurement Exemption):</span>
            <span>₹ 0.00</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Handling, Cleaning & Weighbridge Labour Charges (Subsidized):</span>
            <span>₹ 0.00</span>
          </div>
          <div className="flex justify-between text-sm font-black text-emerald-900 border-t border-dashed border-slate-300 pt-2">
            <span>Net Direct Benefit Transfer (DBT) Payable:</span>
            <span className="text-base text-emerald-700">₹ {receipt.totalAmount.toLocaleString('en-IN')}.00</span>
          </div>
        </div>

        {/* DBT Disbursal Details */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-md p-3 mb-4 text-xs">
          <div className="font-bold text-[10px] uppercase text-emerald-800 mb-1">
            III. PFMS Direct Benefit Transfer (DBT) Clearance
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 block">PFMS REF ID</span>
              <span className="font-mono font-bold text-slate-900">{receipt.transactionId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">PAYMENT MODE</span>
              <span className="font-semibold">AEPS / Aadhaar DBT</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">DESTINATION BANK</span>
              <span className="font-semibold">SBI ({receipt.ifscCode})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">DISBURSAL STATUS</span>
              <span className="font-bold text-emerald-700">✓ CREDITED (SUCCESS)</span>
            </div>
          </div>
        </div>

        {/* Security Verification & Stamps */}
        <div className="grid grid-cols-3 gap-4 items-center border-t-2 border-slate-100 pt-4 mt-2">
          {/* QR Code */}
          <div className="flex items-center space-x-2">
            <div className="w-16 h-16 bg-white border border-slate-900 p-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="5" y="5" width="26" height="26" fill="#000000" />
                <rect x="8" y="8" width="20" height="20" fill="#ffffff" />
                <rect x="12" y="12" width="12" height="12" fill="#000000" />
                <rect x="69" y="5" width="26" height="26" fill="#000000" />
                <rect x="72" y="8" width="20" height="20" fill="#ffffff" />
                <rect x="76" y="12" width="12" height="12" fill="#000000" />
                <rect x="5" y="69" width="26" height="26" fill="#000000" />
                <rect x="8" y="72" width="20" height="20" fill="#ffffff" />
                <rect x="12" y="76" width="12" height="12" fill="#000000" />
                <rect x="36" y="36" width="28" height="28" fill="#000000" />
                <rect x="42" y="42" width="16" height="16" fill="#ffffff" />
                <rect x="46" y="46" width="8" height="8" fill="#047857" />
              </svg>
            </div>
            <div className="text-[9px] text-slate-500 leading-tight">
              <strong className="text-slate-700 block">QR Security</strong>
              Scan to verify on official portal
            </div>
          </div>

          {/* Digital Stamp */}
          <div className="text-center">
            <div className="inline-block border-2 border-dashed border-emerald-600 text-emerald-700 rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rotate-[-4deg]">
              ★ MANDI MARG ★<br />
              GOVT OF INDIA<br />
              WEIGHBRIDGE VERIFIED<br />
              {receipt.tokenNumber}
            </div>
          </div>

          {/* Signatory */}
          <div className="text-right text-xs">
            <div className="text-sm italic font-serif text-blue-900 font-bold mb-0.5">S. Verma</div>
            <strong className="text-slate-900 block text-[10px]">Mandi Procurement Officer</strong>
            <span className="text-slate-500 text-[9px] block">APMC Weighbridge Wing</span>
            <span className="text-emerald-700 text-[9px] font-semibold">Digitally Signed & Validated</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-[9px] text-center text-slate-400 leading-relaxed">
          This is an official digitally generated procurement voucher issued under the National Agricultural E-Procurement Framework. 
          Valid for official agricultural credit, subsidy claims, and crop insurance verifications.
        </div>
      </div>
    </div>
  )
}
