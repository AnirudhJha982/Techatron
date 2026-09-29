import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopNavbar } from "@/components/TopNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGRILENS - Onion Quality Assessment",
  description: "AI-assisted onion quality assessment system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f4f7fe] text-gray-900 min-h-screen flex items-center justify-center p-4 md:p-6`}>
        {/* Outer App Container matching reference border radius and shadow */}
        <div className="flex w-full max-w-[1600px] h-[90vh] min-h-[800px] bg-[#f8f9fc] rounded-[24px] border-[4px] border-white shadow-xl overflow-hidden relative">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full bg-[#f8f9fc] ml-[260px]">
            <TopNavbar />
            <main className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
