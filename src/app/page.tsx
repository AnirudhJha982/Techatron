"use client";

import { Activity, CheckCircle, Clock, Package } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Overview of recent onion quality assessments</p>
        </div>
        <Link 
          href="/new-inspection" 
          className="bg-[#4e3599] hover:bg-[#3d2a7a] text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-purple-900/20 flex items-center gap-2 text-sm"
        >
          <Activity className="w-4 h-4" strokeWidth={2.5} />
          Start New Inspection
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Lots", value: "1,284", icon: Package, color: "text-[#4e3599]", bg: "bg-purple-100/50" },
          { title: "Avg Quality", value: "Grade A", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100/50" },
          { title: "Today's Scans", value: "42", icon: Activity, color: "text-blue-600", bg: "bg-blue-100/50" },
          { title: "Pending Review", value: "3", icon: Clock, color: "text-amber-600", bg: "bg-amber-100/50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-500 mb-0.5">{stat.title}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mt-6 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Inspections</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fc] text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Lot ID</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Centre</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">LOT-{9000 + i}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">Today, 10:{i}4 AM</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">Nashik Main</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#dcfce7] text-[#16a34a]">
                      Grade A
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#4e3599] hover:text-[#3d2a7a] font-bold text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
