"use client";

import { Download } from "lucide-react";

export function FinalAssessment() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="font-bold text-[15px] text-gray-900 tracking-tight">Final Assessment</h3>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col">
        {/* Highlighted Result */}
        <div className="bg-[#dcfce7] rounded-xl py-3 px-4 mb-4 flex flex-col items-center justify-center text-center">
          <h4 className="text-[22px] font-black text-[#16a34a] leading-none mb-1">Grade A</h4>
          <p className="text-[#15803d] text-[12px] font-semibold">Overall Quality: Good</p>
        </div>

        {/* Details Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-4 flex-1">
          <table className="w-full text-[12px] text-left">
            <thead className="bg-[#f8f9fc] text-gray-900 font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5">Parameter</th>
                <th className="px-4 py-2.5">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium">Total Onions (Sample)</td>
                <td className="px-4 py-2">100</td>
              </tr>
              <tr className="bg-[#f8f9fc]/50">
                <td className="px-4 py-2 font-medium">Healthy</td>
                <td className="px-4 py-2">72 (72%)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Damaged / Rotten</td>
                <td className="px-4 py-2">18 (18%)</td>
              </tr>
              <tr className="bg-[#f8f9fc]/50">
                <td className="px-4 py-2 font-medium">Sprouted</td>
                <td className="px-4 py-2">6 (6%)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Others</td>
                <td className="px-4 py-2">4 (4%)</td>
              </tr>
              <tr className="bg-[#f8f9fc]/50">
                <td className="px-4 py-2 font-medium">Average Size</td>
                <td className="px-4 py-2">Medium</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Confidence Score</td>
                <td className="px-4 py-2">92%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto">
          <button 
            onClick={() => alert("Opening detailed view...")}
            className="flex-1 py-3 text-[13px] text-[#4e3599] font-bold rounded-xl hover:bg-purple-50 transition-colors border-[2px] border-[#4e3599]/20"
          >
            View Details
          </button>
          <button 
            onClick={() => alert("Downloading PDF report...")}
            className="flex-1 py-3 text-[13px] bg-[#4e3599] text-white font-bold rounded-xl hover:bg-[#3d2a7a] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
