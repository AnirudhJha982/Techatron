"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  Home, 
  PlusCircle, 
  FileText, 
  PieChart, 
  Building2, 
  Users 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "New Inspection", href: "/new-inspection", icon: PlusCircle },
    { label: "Inspection History", href: "/history", icon: FileText },
    { label: "Reports", href: "/reports", icon: PieChart },
    { label: "Centres", href: "/centres", icon: Building2 },
    { label: "Users", href: "/users", icon: Users },
  ];

  return (
    <div className="w-[260px] bg-[#f8f9fc] h-full flex flex-col fixed left-0 top-0 border-r border-gray-200/60 z-20 overflow-hidden">
      {/* Logo Area */}
      <div className="pt-8 pb-6 px-6 flex items-center gap-3">
        <div className="w-10 h-10 relative flex-shrink-0">
          <Image 
            src="/onion-logo.jpg" 
            alt="Agrilens Logo" 
            fill 
            className="object-cover rounded-full shadow-sm"
          />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-[#4e3599] flex items-center gap-1">
            <span className="text-green-700">AGRI</span>LENS
          </h1>
          <p className="text-[10px] text-gray-800 font-semibold uppercase tracking-wider mt-0.5">Onion Quality Assessment</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#4e3599] text-white shadow-md shadow-purple-900/20"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          All systems operational
        </div>
      </div>
    </div>
  );
}
