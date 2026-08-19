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
function readStepFromUrl(): number {
  if (typeof window === "undefined") return 0;
  const step = new URLSearchParams(window.location.search).get("step");
  if (!step) return 0;

  const stepIndex = STEP_NAMES.indexOf(step);
  if (stepIndex !== -1) return stepIndex;

  const numStep = Number(step);
  if (!isNaN(numStep) && numStep >= 0 && numStep < STEP_NAMES.length) return numStep;
  return 0;
}

/** Saves registration data and identifiers to both sessionStorage and localStorage */
export function saveStoredRegistration(data: Partial<RegistrationInfo> | null) {
  if (typeof window === "undefined" || !data) return;
  try {
    const existingStr = sessionStorage.getItem("userRegistration") || localStorage.getItem("userRegistration");
    let existingObj: Record<string, unknown> = {};
    if (existingStr) {
      try {
        existingObj = JSON.parse(existingStr);
      } catch {
        // ignore
      }
    }
    const merged = { ...existingObj, ...data };
    const serialized = JSON.stringify(merged);
    sessionStorage.setItem("userRegistration", serialized);
    localStorage.setItem("userRegistration", serialized);

    if (data.rcNumber && typeof data.rcNumber === "string" && data.rcNumber.trim() && data.rcNumber !== "STRING") {
      sessionStorage.setItem("rcNumber", data.rcNumber.trim());
      localStorage.setItem("rcNumber", data.rcNumber.trim());
    }
    if (data.companyId && typeof data.companyId === "string" && data.companyId.trim()) {
      sessionStorage.setItem("companyId", data.companyId.trim());
      localStorage.setItem("companyId", data.companyId.trim());
    }
  } catch (e) {
    console.error("Failed to save registration to storage", e);
  }
}

/** The RC number stored in session or local storage, or null when absent. */
export function readStoredRcNumber(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Direct rcNumber key
    const directSession = sessionStorage.getItem("rcNumber");
    if (directSession && directSession.trim() && directSession !== "STRING") {
      return directSession.trim();
    }
    const directLocal = localStorage.getItem("rcNumber");
    if (directLocal && directLocal.trim() && directLocal !== "STRING") {
      return directLocal.trim();
    }

    // 2. userRegistration in sessionStorage
    const storedSession = sessionStorage.getItem("userRegistration");
    if (storedSession) {
      const rc = JSON.parse(storedSession)?.rcNumber;
      if (typeof rc === "string" && rc.trim() && rc !== "STRING") {
        return rc.trim();
      }
    }

    // 3. userRegistration in localStorage
    const storedLocal = localStorage.getItem("userRegistration");
    if (storedLocal) {
      const rc = JSON.parse(storedLocal)?.rcNumber;
      if (typeof rc === "string" && rc.trim() && rc !== "STRING") {
        return rc.trim();
      }
    }

    // 4. Check userProfile
    const profileSession = sessionStorage.getItem("userProfile") || localStorage.getItem("userProfile");
    if (profileSession) {
      const parsed = JSON.parse(profileSession);
      const rc = parsed?.rcNumber || parsed?.registrationNumber;
      if (typeof rc === "string" && rc.trim() && rc !== "STRING") {
        return rc.trim();
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** The cached registration from a previous visit, or null when absent. */
export function readStoredRegistration(): RegistrationInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const stored =
      sessionStorage.getItem("userRegistration") ||
      localStorage.getItem("userRegistration");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // The login response caches a thin summary under the same key; without a
    // company there is nothing worth restoring a step from.
    return parsed?.companyId || parsed?.rcNumber ? parsed : null;
  } catch {
    return null;
  }
}

/** The first step the partner has not finished, from saved progress flags. */
function firstIncompleteStep(data: RegistrationInfo): number {
  if (!data.basicInfoCompleted) return 1;
  if (!data.contactInfoCompleted) return 2;
  if (!data.additionalDetailsCompleted) return 3;
  if (!data.beneficialOwnersCompleted) return 4;
  if (!data.documentsCompleted) return 5;
  return 6;
}

/** The companyId stored in session or local storage, or null when absent. */
export function readStoredCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const directSession = sessionStorage.getItem("companyId");
    if (directSession && directSession.trim()) return directSession.trim();

    const directLocal = localStorage.getItem("companyId");
    if (directLocal && directLocal.trim()) return directLocal.trim();

    const storedSession = sessionStorage.getItem("userRegistration");
    if (storedSession) {
      const id = JSON.parse(storedSession)?.companyId;
      if (typeof id === "string" && id.trim()) return id.trim();
    }

    const storedLocal = localStorage.getItem("userRegistration");
    if (storedLocal) {
      const id = JSON.parse(storedLocal)?.companyId;
      if (typeof id === "string" && id.trim()) return id.trim();
    }
  } catch {
    return null;
  }
  return null;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
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
  // Both start empty on the server *and* on the client's first render. Reading
  // storage in a `useState` initializer runs during render, so the server would
  // send an empty sidebar while hydration rendered a restored one — a mismatch
  // React reports as an error. The saved application is loaded on mount instead.
  const [companyId, setCompanyIdState] = useState<string | null>(null);
  const [registrationData, setRegistrationDataState] =
    useState<RegistrationInfo | null>(null);

  const setCompanyId = (id: string | null) => {
    setCompanyIdState(id);
    if (id) {
      saveStoredRegistration({ companyId: id });
    }
  };

  const setRegistrationData: Dispatch<SetStateAction<RegistrationInfo | null>> = (
    dataOrUpdater
  ) => {
    setRegistrationDataState((prev) => {
      const next = typeof dataOrUpdater === "function" ? dataOrUpdater(prev) : dataOrUpdater;
      if (next) {
        saveStoredRegistration(next);
      }
      return next;
    });
  };

  // Assume a restore is needed until the mount effect has read the storage & URL
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const lastRefreshedRcNumber = useRef<string | null>(null);
  const autoJumpedForCompany = useRef<string | null>(null);

  /**
   * A rejected document can only be acted on from the documents step, so take
   * the partner there as soon as we learn about it. Once per company.
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
   * Re-reads the registration from the server (by RC number) and merges it in.
   */
  const refreshRegistration = async (): Promise<RegistrationInfo | null> => {
    const rcNumber = registrationData?.rcNumber || readStoredRcNumber();
    if (!rcNumber) return null;

    const res = await lookupCompany.mutateAsync(rcNumber);
    const data = res?.data;
    if (!data) return null;

    lastRefreshedRcNumber.current = rcNumber;
    if (data.companyId) setCompanyIdState(data.companyId);
    setRegistrationData(prev => ({ ...(prev || {}), ...data }) as RegistrationInfo);
    saveStoredRegistration(data);
    return data;
  };

  /**
   * Restores the session after a page refresh.
   *
   * The cached copy is applied first so the partner's details are on screen
   * immediately — waiting on the network here is what made a refresh look like
   * it had wiped everything. The server is then read in the background and
   * merged over the top.
   */
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps --
     storage and the URL can only be read once mounted, so the restored step and
     registration necessarily land as state from here. */
  useEffect(() => {
    const cached = readStoredRegistration();
    const storedRcNumber = cached?.rcNumber || readStoredRcNumber();
    const stepFromUrl = readStepFromUrl();

    /** The URL wins; otherwise resume where the saved progress left off. */
    const resumeTo = (data: RegistrationInfo) => {
      if (jumpToRejectedDocuments(data)) return;
      setCurrentStep(stepFromUrl > 0 ? stepFromUrl : firstIncompleteStep(data));
    };

    if (cached) {
      setRegistrationDataState(cached);
      if (cached.companyId) setCompanyIdState(cached.companyId);
      resumeTo(cached);
      setIsRestoringSession(false);
    } else {
      const storedCompanyId = readStoredCompanyId();
      if (storedCompanyId) setCompanyIdState(storedCompanyId);
      // No cached copy: hold on the loader rather than mounting a later step
      // whose form would initialise with nothing in it.
      if (!storedRcNumber) setIsRestoringSession(false);
    }

    if (!storedRcNumber) return;

    lastRefreshedRcNumber.current = storedRcNumber;
    lookupCompany
      .mutateAsync(storedRcNumber)
      .then(res => {
        const data = res?.data;
        if (!data?.companyId) return;

        setCompanyIdState(data.companyId);
        setRegistrationDataState(data);
        saveStoredRegistration(data);
        if (cached) jumpToRejectedDocuments(data);
        else resumeTo(data);
      })
      .catch(err => {
        console.error("Failed to restore onboarding session", err);
      })
      .finally(() => setIsRestoringSession(false));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Refresh data on step changes if RC number is available
  useEffect(() => {
    if (!registrationData?.rcNumber) return;
    if (lastRefreshedRcNumber.current === registrationData.rcNumber) return;

    lastRefreshedRcNumber.current = registrationData.rcNumber;

    lookupCompany.mutateAsync(registrationData.rcNumber)
      .then(res => {
        if (res?.data) {
          setRegistrationData(res.data);
          saveStoredRegistration(res.data);
          jumpToRejectedDocuments(res.data);
        }
      })
      .catch(err => console.error("Failed to refresh profile on step change", err));
  }, [currentStep, registrationData?.rcNumber]); // eslint-disable-line react-hooks/exhaustive-deps

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
