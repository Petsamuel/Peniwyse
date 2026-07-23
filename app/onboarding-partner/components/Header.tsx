"use client";

import Image from "next/image";
import { MdLogout, MdLanguage } from "react-icons/md";
import { clearClientToken } from "@/app/utils/auth";
import { useRouter } from "next/navigation";
import { useOnboardingPartner } from "../context/OnboardingContext";

export default function Header() {
  const router = useRouter();
  const { completedSteps, registrationData } = useOnboardingPartner();
  
  const progress = registrationData?.percentComplete ?? Math.round((completedSteps.length / 6) * 100);

  const handleLogout = () => {
    clearClientToken();
    localStorage.removeItem("peniwyse_role");
    window.location.href = "/login";
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between z-10 sticky top-0">
      {/* Mobile Progress Indicator */}
      <div className="flex md:hidden items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg className="w-9 h-9 transform -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="currentColor"
              strokeWidth="3.5"
              fill="transparent"
              className="text-slate-200"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="currentColor"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray="87.96"
              strokeDashoffset={87.96 - (87.96 * progress) / 100}
              className="text-accent transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col -space-y-0.5">
            <span className="text-xs font-bold text-slate-800">{progress}%</span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-6">
        {/* Language Selector (Mock) */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer hover:text-foreground transition-colors">
          <MdLanguage size={18} />
          <span>English</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Log out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <MdLogout size={18} className="text-slate-500" />
          Log out
        </button>
      </div>
    </header>
  );
}
