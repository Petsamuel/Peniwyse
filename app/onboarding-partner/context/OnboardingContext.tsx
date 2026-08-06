"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, useRef } from "react";
import { RegistrationInfo, useLookupCompany } from "../../hooks/use-onboarding";
import { hasRejectedDocuments } from "../utils/document-review";

interface OnboardingContextProps {
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  completedSteps: number[];
  markStepCompleted: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  registrationData: RegistrationInfo | null;
  setRegistrationData: Dispatch<SetStateAction<RegistrationInfo | null>>;
  /** Sends the partner to the documents step if a reviewer rejected anything. Returns true when it navigated. */
  jumpToRejectedDocuments: (data: RegistrationInfo | null) => boolean;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

const STEP_NAMES = [
  "find-company",
  "basic-info",
  "contact-info",
  "additional-details",
  "beneficial-owners",
  "documents-upload",
  "review-submit"
];

export const DOCUMENTS_STEP = STEP_NAMES.indexOf("documents-upload");

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStepState] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const step = params.get("step");
      if (step) {
        const stepIndex = STEP_NAMES.indexOf(step);
        if (stepIndex !== -1) return stepIndex;
        const numStep = Number(step);
        if (!isNaN(numStep) && numStep >= 0 && numStep < STEP_NAMES.length) return numStep;
      }
    }
    return 0;
  });

  const setCurrentStep = (step: number | ((prev: number) => number)) => {
    setCurrentStepState((prev) => {
      const nextStep = typeof step === 'function' ? step(prev) : step;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("step", STEP_NAMES[nextStep] || nextStep.toString());
        window.history.replaceState({}, '', url.toString());
      }
      return nextStep;
    });
  };

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationInfo | null>(null);
  const lastRefreshedRcNumber = useRef<string | null>(null);
  const autoJumpedForCompany = useRef<string | null>(null);

  /**
   * A rejected document can only be acted on from the documents step, so take
   * the partner there as soon as we learn about it. Once per company — after
   * that they are free to move around without being pulled back.
   */
  const jumpToRejectedDocuments = (data: RegistrationInfo | null) => {
    if (!data) return false;
    const key = data.companyId || data.rcNumber;
    if (!key || autoJumpedForCompany.current === key) return false;
    if (!hasRejectedDocuments(data as unknown as Record<string, unknown>)) return false;

    autoJumpedForCompany.current = key;
    setCurrentStep(DOCUMENTS_STEP);
    return true;
  };

  const lookupCompany = useLookupCompany();

  useEffect(() => {
    if (!registrationData?.rcNumber) return;
    if (lastRefreshedRcNumber.current === registrationData.rcNumber) return;

    lastRefreshedRcNumber.current = registrationData.rcNumber;

    lookupCompany.mutateAsync(registrationData.rcNumber)
      .then(res => {
        if (res.success && res.data) {
          setRegistrationData(res.data);
          jumpToRejectedDocuments(res.data);
        }
      })
      .catch(err => console.error("Failed to refresh profile on step change", err));
  }, [currentStep, registrationData?.rcNumber]);

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
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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
        jumpToRejectedDocuments,
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
