"use client";

import { useOnboardingPartner } from "../context/OnboardingContext";
import { MdCheck } from "react-icons/md";
import Image from "next/image";

const STEPS = [
  { id: 1, title: "Basic Information" },
  { id: 2, title: "Contact Information" },
  { id: 3, title: "Additional Details" },
  { id: 4, title: "Beneficial Owners" },
  { id: 5, title: "Documents Upload" },
  { id: 6, title: "Review & Submit" },
];

export default function Sidebar() {
  const { currentStep, completedSteps, registrationData, setCurrentStep } =
    useOnboardingPartner();

  const progress =
    registrationData?.percentComplete ??
    Math.round((completedSteps.length / STEPS.length) * 100);

  const checkIsCompleted = (id: number) => {
    let isCompletedByData = false;
    if (registrationData) {
      if (id === 1) isCompletedByData = registrationData.basicInfoCompleted;
      if (id === 2) isCompletedByData = registrationData.contactInfoCompleted;
      if (id === 3)
        isCompletedByData = registrationData.additionalDetailsCompleted;
      if (id === 4)
        isCompletedByData = registrationData.beneficialOwnersCompleted;
      if (id === 5) isCompletedByData = registrationData.documentsCompleted;
      if (id === 6)
        isCompletedByData = registrationData.percentComplete === 100;
    }
    return !!isCompletedByData || completedSteps.includes(id);
  };

  return (
    <div className="flex flex-col h-full py-8 px-6 justify-between bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Effect matching design */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent opacity-10 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-4 mb-10 px-2">
        <div className="h-auto w-10 shrink-0 overflow-hidden flex items-center justify-center">
          <Image
            src="/logo2.png"
            alt="Logo"
            width={16}
            height={16}
            className="h-full w-[30px] object-contain scale-[1] translate-y-[5%]"
          />
        </div>
        <span className="text-xl font-semibold text-slate-800 tracking-tight -ml-4">
          Peniwyse
        </span>
      </div>

      {/* Steps List */}
      <div className="relative z-10 flex flex-col gap-6 flex-1">
        {STEPS.map((step, index) => {
          const isCompleted = checkIsCompleted(step.id);
          const isActive = currentStep === step.id;
          const isFuture = !isCompleted && !isActive;

          return (
            <div key={step.id} className="flex flex-col relative">
              {/* Connector Line */}
              {index !== STEPS.length - 1 && (
                <div
                  className={`absolute left-[11px] top-[28px] bottom-[-24px] w-[2px] ${
                    isCompleted ? "bg-accent" : "bg-slate-200"
                  }`}
                />
              )}

              <button
                onClick={() => {
                  if (isCompleted || isActive) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex items-start gap-4 text-left ${
                  isCompleted || isActive
                    ? "cursor-pointer hover:opacity-80 transition-opacity"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                {/* Step Indicator */}
                <div
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 z-10 transition-colors ${
                    isCompleted
                      ? "border-accent bg-accent text-white"
                      : isActive
                        ? "border-accent border-[6px] bg-white"
                        : "border-slate-300 bg-white"
                  }`}
                >
                  {isCompleted && (
                    <MdCheck size={14} className="font-bold text-white" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex flex-col -mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Step {step.id}
                    </span>
                    {isCompleted && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-accent/10 text-accent rounded uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                    {isActive && !isCompleted && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wider">
                        In progress
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-semibold mt-0.5 transition-colors ${
                      isActive || isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="relative z-10 mt-auto bg-white/80 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 w-fit">
        {/* Simple SVG Circular Progress */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-slate-200"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="100.53" /* 2 * PI * 16 */
              strokeDashoffset={100.53 - (100.53 * progress) / 100}
              className="text-accent transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="font-bold text-slate-800 text-sm">
          {progress}% complete
        </span>
      </div>
    </div>
  );
}
