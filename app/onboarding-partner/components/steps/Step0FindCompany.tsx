"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import { MdOutlineBusinessCenter, MdSearch, MdArrowForward, MdOutlineAddBusiness, MdOutlineCancel, MdEdit } from "react-icons/md";
import { useLookupCompany, useStartRegistration, RegistrationInfo } from "@/app/hooks/use-onboarding";

export default function Step0FindCompany() {
  const { setCurrentStep, setCompanyId, setRegistrationData } = useOnboardingPartner();
  const lookupCompany = useLookupCompany();
  const startRegistration = useStartRegistration();

  const [rcNumber, setRcNumber] = useState("");
  const [searchStatus, setSearchStatus] = useState<"idle" | "found" | "not_found">("idle");
  const hasAutoSearched = useRef(false);

  const performSearch = async (queryRc: string) => {
    if (!queryRc.trim()) return;
    
    setSearchStatus("idle");
    try {
      const response = await lookupCompany.mutateAsync(queryRc);
      const data = response?.data;
      
      // API response: { data: RegistrationInfo }
      const companyIdFromResponse = data?.companyId;

      if (companyIdFromResponse) {
        setSearchStatus("found");
        setCompanyId(companyIdFromResponse);
        setRegistrationData(data);
        
        // Determine the next incomplete step
        let targetStep = 1;
        if (!data?.basicInfoCompleted) targetStep = 1;
        else if (!data?.contactInfoCompleted) targetStep = 2;
        else if (!data?.additionalDetailsCompleted) targetStep = 3;
        else if (!data?.beneficialOwnersCompleted) targetStep = 4;
        else if (!data?.documentsCompleted) targetStep = 5;
        else targetStep = 6;

        // Small delay to show the "found" state before transitioning
        setTimeout(() => setCurrentStep(targetStep), 800);
      } else {
        setSearchStatus("not_found");
      }
    } catch (err) {
      setSearchStatus("not_found");
    }
  };

  useEffect(() => {
    if (hasAutoSearched.current) return;
    
    const storedReg = sessionStorage.getItem("userRegistration");
    if (storedReg) {
      try {
        const parsedReg = JSON.parse(storedReg);
        const storedRc = parsedReg.rcNumber;
        
        // Ensure rcNumber exists, is not empty, and isn't a placeholder like "STRING"
        if (storedRc && typeof storedRc === 'string' && storedRc.trim() !== "" && storedRc !== "STRING") {
          hasAutoSearched.current = true;
          setTimeout(() => {
            setRcNumber(storedRc);
            performSearch(storedRc);
          }, 0);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(rcNumber);
  };

  const handleManual = async () => {
    try {
      // Start afresh using the RC Number they entered
      const response = await startRegistration.mutateAsync({ rcNumber: rcNumber.trim() });
      const newCompanyId = response?.status?.companyId || response?.data?.status?.companyId || response?.form?.id || response?.data?.form?.id;
      
      if (newCompanyId) {
        setCompanyId(newCompanyId);
        
        // Populate current form with returned data by mapping it to RegistrationInfo format
        const form = response?.form || response?.data?.form || {};
        const mappedData = {
          companyId: newCompanyId,
          rcNumber: form.rcNumber || rcNumber.trim(),
          legalBusinessName: form.companyName || "",
          businessEmail: form.email || "",
          streetAddress: form.address || "",
          state: form.state || "",
          city: form.city || "",
          businessDescription: form.natureOfBusiness || "",
        } as RegistrationInfo;
        setRegistrationData(mappedData);
        
        setCurrentStep(1);
      } else {
        console.error("Failed to start new registration: no companyId returned");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Let&apos;s get started</h2>
        <p className="text-slate-500 text-[15px] leading-relaxed">
          Welcome! Whether you are resuming an existing application or starting a new one, enter your RC Number below to continue.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MdSearch size={22} className="text-slate-400 group-focus-within:text-accent transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Enter RC Number (e.g. RC123456)"
          value={rcNumber}
          onChange={(e) => {
            setRcNumber(e.target.value);
            setSearchStatus("idle"); // Reset status on type
          }}
          className="w-full h-14 pl-12 pr-32 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all bg-white text-base font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
        />
        <div className="absolute inset-y-1 right-1">
          <button
            type="submit"
            disabled={lookupCompany.isPending || !rcNumber.trim()}
            className="h-full px-6 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 shadow-sm"
          >
            {lookupCompany.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue <MdArrowForward size={16} />
              </span>
            )}
          </button>
        </div>
      </form>

      {/* States */}
      <div className="min-h-[120px]">
        {searchStatus === "found" && (
          <div className="flex gap-4 p-5 bg-green-50/50 border border-green-200 shadow-sm rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-12 h-12 shrink-0 bg-green-100 flex items-center justify-center rounded-xl border border-green-200 text-green-600">
              <MdOutlineBusinessCenter size={24} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] text-green-800 font-bold mb-0.5">Company Found</p>
              <p className="text-[14px] text-green-600/80 font-medium">Resuming your application...</p>
            </div>
          </div>
        )}

        {searchStatus === "not_found" && (
          <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-red-500">
              <MdOutlineCancel size={22} />
              <span className="text-[15px] font-bold">We did not find any results for this RC Number.</span>
            </div>

            <button
              type="button"
              onClick={handleManual}
              disabled={startRegistration.isPending}
              className="flex items-center gap-2 h-11 px-5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 shadow-sm"
            >
              <MdEdit size={18} />
              {startRegistration.isPending ? "Starting..." : "Fill details manually"}
            </button>
          </div>
        )}

        {searchStatus === "idle" && !lookupCompany.isPending && (
          <div className="flex gap-4 p-5 bg-slate-50/50 border border-slate-200 shadow-sm rounded-2xl">
            <div className="w-10 h-10 shrink-0 bg-white flex items-center justify-center rounded-xl border border-slate-200 text-slate-400">
              <MdOutlineBusinessCenter size={20} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[14px] text-slate-600 font-medium mb-0.5">Secure Onboarding</p>
              <p className="text-[13px] text-slate-500">
                Your data is protected and will be securely analyzed by our team.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
