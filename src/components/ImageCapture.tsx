"use client";

import { Scan, Plus } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface ImageCaptureProps {
  onAnalyze: () => void;
}

export function ImageCapture({ onAnalyze }: ImageCaptureProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onAnalyze();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-5 pb-3">
        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Capture Onion Images</h2>
        <p className="text-[13px] text-gray-500 font-medium">Take multiple images from different angles</p>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
        {/* Images Area */}
        <div className="flex gap-3 h-[280px]">
          {/* Main Image */}
          <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200">
            <Image 
              src="/onion-capture.jpg" 
              alt="Onions" 
              fill 
              className="object-cover"
            />
            {/* Mock AI Bounding Boxes */}
            <div className="absolute top-[10%] left-[15%] w-[30%] h-[35%] border-[2px] border-[#16a34a]">
              <span className="absolute -top-6 left-0 bg-[#16a34a] text-white text-[11px] font-bold px-2 py-0.5 rounded-t-sm">Healthy</span>
            </div>
            <div className="absolute top-[40%] left-[35%] w-[32%] h-[40%] border-[2px] border-[#dc2626]">
              <span className="absolute -top-6 left-0 bg-[#dc2626] text-white text-[11px] font-bold px-2 py-0.5 rounded-t-sm">Rotten</span>
            </div>
            <div className="absolute top-[55%] left-[70%] w-[25%] h-[30%] border-[2px] border-[#d97706]">
              <span className="absolute -top-6 left-0 bg-[#d97706] text-white text-[11px] font-bold px-2 py-0.5 rounded-t-sm">Sprouted</span>
            </div>
            <div className="absolute top-[65%] left-[10%] w-[25%] h-[30%] border-[2px] border-[#16a34a]">
              <span className="absolute -top-6 left-0 bg-[#16a34a] text-white text-[11px] font-bold px-2 py-0.5 rounded-t-sm">Healthy</span>
            </div>
          </div>

          {/* Thumbnails Sidebar */}
          <div className="w-[100px] flex flex-col gap-2 shrink-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 relative rounded-lg overflow-hidden border border-gray-200 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                <Image 
                  src="/onion-capture.jpg" 
                  alt={`View ${i}`} 
                  fill 
                  className="object-cover"
                />
              </div>
            ))}
            
            <button className="flex-1 rounded-lg border-2 border-dashed border-[#4e3599]/30 bg-purple-50/50 flex flex-col items-center justify-center text-[#4e3599] hover:bg-purple-50 transition-colors">
              <Plus className="w-5 h-5 mb-0.5" strokeWidth={2.5} />
              <span className="text-[11px] font-bold">Add Image</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-3.5 mt-2 bg-[#4e3599] hover:bg-[#3d2a7a] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing Images...
            </>
          ) : (
            <>
              <Scan className="w-5 h-5" strokeWidth={2.5} />
              Analyze Images
            </>
          )}
        </button>
      </div>
    </div>
  );
}
