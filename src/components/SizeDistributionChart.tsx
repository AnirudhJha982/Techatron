"use client";

export function SizeDistributionChart() {
  const data = [
    { label: "Small", percentage: "25%", value: 25, color: "bg-[#4e3599]" },
    { label: "Medium", percentage: "50%", value: 50, color: "bg-[#4e3599]" },
    { label: "Large", percentage: "20%", value: 20, color: "bg-[#4e3599]" },
    { label: "Extra Large", percentage: "5%", value: 5, color: "bg-[#4e3599]" },
  ];

  // Find max for scaling
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex flex-col h-[260px]">
      <h3 className="font-bold text-[15px] text-gray-900 mb-6 tracking-tight">Size Distribution</h3>
      
      <div className="flex-1 flex items-end justify-center gap-6 px-4 pb-2 mt-auto">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center group w-12">
            <div className="w-8 bg-transparent relative flex justify-center h-28">
              <div 
                className={`absolute bottom-0 w-full rounded-t-sm ${item.color} transition-all duration-1000 ease-out opacity-90`}
                style={{ height: `${(item.value / max) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-3 leading-tight flex flex-col">
              <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
              <span className="text-[10px] text-gray-500">({item.percentage})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
