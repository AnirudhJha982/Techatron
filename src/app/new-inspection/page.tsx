"use client";

import { useState } from "react";
import { StepProgress } from "@/components/StepProgress";
import { ImageCapture } from "@/components/ImageCapture";
import { AnalysisStats } from "@/components/AnalysisStats";
import { SizeDistributionChart } from "@/components/SizeDistributionChart";
import { GradeChart } from "@/components/GradeChart";
import { FinalAssessment } from "@/components/FinalAssessment";

export default function NewInspectionPage() {
  const [currentStep, setCurrentStep] = useState(2);

  const handleAnalyze = () => {
    setCurrentStep(3);
    setTimeout(() => setCurrentStep(4), 500);
    setTimeout(() => setCurrentStep(5), 1000);
  };

  return (
    <div className="w-full h-full flex flex-col max-w-[1300px] mx-auto">
      <div className="flex flex-col mb-4">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">New Quality Assessment</h1>
      </div>

      <StepProgress currentStep={currentStep} />

      {currentStep === 2 && (
        <div className="w-full flex-1 max-h-[500px] max-w-[700px]">
          <ImageCapture onAnalyze={handleAnalyze} />
        </div>
      )}

      {currentStep >= 3 && (
        <div className="grid grid-cols-[1fr_350px] gap-6 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-6">
            <AnalysisStats />
            <div className="grid grid-cols-2 gap-6">
              <SizeDistributionChart />
              <GradeChart />
            </div>
          </div>
          <div>
            <FinalAssessment />
          </div>
        </div>
      )}
    </div>
  );
}
