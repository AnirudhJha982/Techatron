"use client";

import { Info } from "lucide-react";

export function AnalysisStats() {
  const stats = [
    { label: "Healthy", count: 72, percentage: 72, color: "text-[#16a34a]", bg: "bg-[#dcfce7]" },
    { label: "Damaged / Rotten", count: 18, percentage: 18, color: "text-[#dc2626]", bg: "bg-[#fee2e2]" },
    { label: "Sprouted", count: 6, percentage: 6, color: "text-[#d97706]", bg: "bg-[#fef3c7]" },
    { label: "Others", count: 4, percentage: 4, color: "text-[#4b5563]", bg: "bg-[#f3f4f6]" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-[15px] text-gray-900 tracking-tight">AI Analysis Results</h3>
        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-3 flex flex-col items-center justify-center text-center`}>
            <span className={`text-[11px] font-bold mb-1.5 ${stat.color} leading-tight h-8 flex items-center`}>{stat.label}</span>
            <span className={`text-[22px] font-black ${stat.color} leading-none mb-0.5`}>{stat.count}</span>
            <span className={`text-[11px] font-bold ${stat.color}`}>({stat.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
