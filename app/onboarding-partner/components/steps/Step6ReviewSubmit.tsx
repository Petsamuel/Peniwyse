"use client";

import { useState } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import { useSubmitRegistration } from "@/app/hooks/use-onboarding";
import { MdCheckCircle, MdErrorOutline, MdBusiness, MdOutlineContactPhone, MdInfoOutline } from "react-icons/md";

export default function Step6ReviewSubmit() {
  const { goToPrevStep, registrationData, setRegistrationData, markStepCompleted } = useOnboardingPartner();
  const submitRegistration = useSubmitRegistration();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!registrationData?.companyId) {
      setError("Company ID is missing.");
      return;
    }
    
    setError(null);
    try {
      const response = await submitRegistration.mutateAsync(registrationData.companyId);
      if (response) {
        setRegistrationData(response);
      }
      markStepCompleted(6);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting the registration.");
    }
  };

  if (isSuccess || registrationData?.submissionStatus === "Submitted") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <MdCheckCircle className="w-24 h-24 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Registration Submitted!</h2>
        <p className="text-slate-600 text-center max-w-md mb-8">
          Your onboarding application has been successfully submitted for review. We will notify you once the process is complete.
        </p>
        {/* <button
          onClick={() => window.location.href = '/login'}
          className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-sm"
        >
          Go to Dashboard
        </button> */}
      </div>
    );
  }
  

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 max-w-3xl w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Review & Submit</h2>
        <p className="text-slate-500 text-sm">
          Please review your information before final submission. Once submitted, your application will be under review.
        </p>
      </div>

      {registrationData?.approvalStatus === "Rejected" && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <MdErrorOutline className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold mb-1">Application Requires Updates</h3>
            <p className="text-red-600 text-sm">
              {registrationData.reviewNote || "Please review and update your application details before resubmitting."}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-8 pb-8">
        {/* Preview Sections */}
        {registrationData && (
          <div className="space-y-8 bg-transparent">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <MdBusiness className="text-accent" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Legal Business Name</span>
                  <span className="font-medium text-slate-800">{registrationData.legalBusinessName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Trading Name</span>
                  <span className="font-medium text-slate-800">{registrationData.tradingName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RC/Registration Number</span>
                  <span className="font-medium text-slate-800">{registrationData.rcNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Business Type</span>
                  <span className="font-medium text-slate-800">{registrationData.businessType || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <MdOutlineContactPhone className="text-accent" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Business Email</span>
                  <span className="font-medium text-slate-800">{registrationData.businessEmail || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone Number</span>
                  <span className="font-medium text-slate-800">
                    {registrationData.phoneCountryCode ? `${registrationData.phoneCountryCode} ` : ''}
                    {registrationData.phoneNumber || "N/A"}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500 block">Address</span>
                  <span className="font-medium text-slate-800">
                    {[registrationData.streetAddress, registrationData.city, registrationData.state, registrationData.operatingCountry || registrationData.countryOfIncorporation].filter(Boolean).join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <MdInfoOutline className="text-accent" /> Additional Details
              </h3>
              <div className="text-sm">
                <span className="text-slate-500 block">Business Description</span>
                <span className="font-medium text-slate-800">{registrationData.businessDescription || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center mt-12 pt-8">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
             <MdCheckCircle className="w-8 h-8 text-accent" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">
             {registrationData?.approvalStatus === "Rejected" ? "Ready to Resubmit" : "Ready to Submit"}
           </h3>
           <p className="text-slate-600 max-w-md">
             {registrationData?.approvalStatus === "Rejected" 
               ? "Please ensure you have addressed the feedback above. Click the button below to resubmit your application."
               : "You have completed all necessary steps. Click the button below to submit your onboarding application."}
           </p>
           
           {error && (
              <div className="w-full max-w-md mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <MdErrorOutline className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-left">{error}</div>
              </div>
           )}
        </div>
      </div>

      <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
        <button
          onClick={goToPrevStep}
          disabled={submitRegistration.isPending}
          className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitRegistration.isPending}
          className="flex items-center justify-center px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-70 min-w-[160px]"
        >
          {submitRegistration.isPending ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : registrationData?.approvalStatus === "Rejected" ? (
            "Resubmit Application"
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );
}
