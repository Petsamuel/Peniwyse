"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";
import { RegistrationInfo, useLookupCompany } from "../../hooks/use-onboarding";

interface OnboardingContextProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedSteps: number[];
  markStepCompleted: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  registrationData: RegistrationInfo | null;
  setRegistrationData: Dispatch<SetStateAction<RegistrationInfo | null>>;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationInfo | null>(null);

  const lookupCompany = useLookupCompany();

  useEffect(() => {
    if (registrationData?.rcNumber) {
      lookupCompany.mutateAsync(registrationData.rcNumber)
        .then(res => {
          if (res.success && res.data) {
            setRegistrationData(res.data);
          }
        })
        .catch(err => console.error("Failed to refresh profile on step change", err));
    }
  }, [currentStep]);

  const markStepCompleted = (step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const markStepIncomplete = (step: number) => {
    setCompletedSteps((prev) => prev.filter((s) => s !== step));
  };

  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        completedSteps,
        markStepCompleted,
        markStepIncomplete,
        goToNextStep,
        goToPrevStep,
        companyId,
        setCompanyId,
        registrationData,
        setRegistrationData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingPartner() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboardingPartner must be used within an OnboardingProvider");
  }
  return context;
}
