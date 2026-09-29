"use client";

import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";

export function TopNavbar() {
  return (
    <header className="h-20 bg-[#f8f9fc] flex items-center justify-end px-8 shrink-0">
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5" strokeWidth={2.5} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8f9fc]"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-full hover:bg-white hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-full overflow-hidden relative">
            <Image 
              src="/user-avatar.jpg" 
              alt="User" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-sm text-gray-900">Procurement Staff</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 mr-1" strokeWidth={2.5} />
        </div>
      </div>
    </header>
  );
}
