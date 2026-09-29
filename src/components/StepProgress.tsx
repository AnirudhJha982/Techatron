"use client";

interface StepProgressProps {
  currentStep: number;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { id: 1, label: "Lot Details" },
    { id: 2, label: "Image Capture" },
    { id: 3, label: "AI Analysis" },
    { id: 4, label: "Grading & Review" },
    { id: 5, label: "Final Report" },
  ];

  return (
    <div className="w-full mb-8 mt-2 px-10">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-4 w-full h-[2px] bg-gray-200 z-0"></div>
        <div 
          className="absolute left-0 top-4 h-[2px] bg-[#4e3599] z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted || isCurrent
                    ? "bg-[#4e3599] text-white ring-4 ring-[#f8f9fc]"
                    : "bg-white text-gray-500 ring-4 ring-[#f8f9fc] border-[2px] border-gray-200"
                }`}
              >
                {step.id}
              </div>
              <span 
                className={`mt-2 text-[13px] font-bold absolute -bottom-7 w-28 text-center tracking-tight ${
                  isCurrent ? "text-[#4e3599]" : isCompleted ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8"></div>
    </div>
  );
}
