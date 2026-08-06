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
  /** True while the step and registration are being restored after a page load. */
  isRestoringSession: boolean;
  /** Re-reads the registration from the server (by RC number) and merges it in. */
  refreshRegistration: () => Promise<RegistrationInfo | null>;
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

/** The step named in the URL, or 0 when there isn't a usable one. */
function readStepFromUrl() {
  const step = new URLSearchParams(window.location.search).get("step");
  if (!step) return 0;

  const stepIndex = STEP_NAMES.indexOf(step);
  if (stepIndex !== -1) return stepIndex;

  const numStep = Number(step);
  if (!isNaN(numStep) && numStep >= 0 && numStep < STEP_NAMES.length) return numStep;
  return 0;
}

/** The RC number stored at login, or null when it is absent or a placeholder. */
function readStoredRcNumber() {
  try {
    const stored = sessionStorage.getItem("userRegistration");
    if (!stored) return null;
    const rcNumber = JSON.parse(stored)?.rcNumber;
    return typeof rcNumber === "string" && rcNumber.trim() !== "" && rcNumber !== "STRING"
      ? rcNumber
      : null;
  } catch {
    return null;
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Starts at 0 on both server and client — the URL is read after mount, so the
  // server never renders one step only for hydration to swap in another.
  const [currentStep, setCurrentStepState] = useState(0);

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
  // Assume a restore is needed until the mount effect has read the URL, so no
  // step renders before we know which one it should be.
  const [isRestoringSession, setIsRestoringSession] = useState(true);
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

  /**
   * Re-reads the registration from the server and merges it in.
   *
   * Several endpoints (document completion, submission) answer with a small
   * status object rather than the whole registration, so callers must merge
   * instead of replace — otherwise the RC number is lost and nothing can be
   * fetched again. The RC number falls back to the one stored at login for the
   * same reason.
   */
  const refreshRegistration = async (): Promise<RegistrationInfo | null> => {
    const rcNumber = registrationData?.rcNumber || readStoredRcNumber();
    if (!rcNumber) return null;

    const res = await lookupCompany.mutateAsync(rcNumber);
    const data = res?.data;
    if (!data) return null;

    lastRefreshedRcNumber.current = rcNumber;
    if (data.companyId) setCompanyId(data.companyId);
    setRegistrationData(prev => ({ ...(prev || {}), ...data }) as RegistrationInfo);
    return data;
  };

  /**
   * Restores the session after a page refresh.
   *
   * The step survives a reload through the `step` query param, but the
   * registration itself lives in memory only — and the lookup that fetches it
   * belongs to Step 0, which is not mounted on any later step. Without this the
   * partner reloads onto a step with no company: an empty sidebar, 0% progress
   * and a submit that fails for a missing company id.
   */
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps --
     the URL and sessionStorage can only be read once mounted, so the restored
     step and registration necessarily land as state from here. */
  useEffect(() => {
    const targetStep = readStepFromUrl();
    const storedRcNumber = readStoredRcNumber();

    // Step 0 restores itself: it runs the same lookup from the stored RC number
    // and picks the step to resume on. Nothing stored means nothing to restore,
    // so leave them on step 0 to search rather than on a step with no company.
    if (targetStep === 0 || !storedRcNumber) {
      setIsRestoringSession(false);
      return;
    }

    lastRefreshedRcNumber.current = storedRcNumber;

    lookupCompany.mutateAsync(storedRcNumber)
      .then(res => {
        const data = res?.data;
        if (!data?.companyId) return; // stays on step 0

        setCompanyId(data.companyId);
        setRegistrationData(data);
        if (!jumpToRejectedDocuments(data)) setCurrentStep(targetStep);
      })
      .catch(err => {
        console.error("Failed to restore onboarding session", err);
      })
      .finally(() => setIsRestoringSession(false));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!registrationData?.rcNumber) return;
    if (lastRefreshedRcNumber.current === registrationData.rcNumber) return;

    lastRefreshedRcNumber.current = registrationData.rcNumber;

    lookupCompany.mutateAsync(registrationData.rcNumber)
      .then(res => {
        if (res?.data) {
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
        isRestoringSession,
        refreshRegistration,
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
