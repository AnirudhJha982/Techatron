"use client";

export function GradeChart() {
  const data = [
    { label: "Grade A", percentage: "(72%)", value: 72, color: "#16a34a" },
    { label: "URS", percentage: "(18%)", value: 18, color: "#d97706" },
    { label: "Reject", percentage: "(10%)", value: 10, color: "#dc2626" },
  ];

  let currentPercentage = 0;
  const gradientStops = data.map(item => {
    const start = currentPercentage;
    const end = currentPercentage + item.value;
    currentPercentage = end;
    return `${item.color} ${start}% ${end}%`;
  }).join(", ");

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex flex-col h-[260px]">
      <h3 className="font-bold text-[15px] text-gray-900 mb-6 tracking-tight">Predicted Grade</h3>
      
      <div className="flex-1 flex flex-row items-center justify-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${gradientStops})` }}>
          {/* Inner circle */}
          <div className="absolute w-[80px] h-[80px] bg-white rounded-full flex flex-col items-center justify-center pt-1 shadow-inner">
            <span className="text-[26px] font-black text-gray-900 leading-none">A</span>
            <span className="text-[11px] font-bold text-gray-700 mt-1">(72%)</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3.5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="font-semibold text-gray-700">{item.label}</span>
              <span className="text-gray-500 font-medium">{item.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
