"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EntityOnboarding from "./entity-onboarding";
import {
  usePartnerByRcNumber,
} from "@/app/hooks/use-onboarding";


function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rc = searchParams.get("rc");
  const idParam = searchParams.get("id");
  const statusParam = searchParams.get("status");

  const needsFetch = !!rc && !idParam;
  const { data: lookup, isPending } = usePartnerByRcNumber(
    needsFetch ? rc! : "",
  );

  const tradingPartnerId = idParam ?? lookup?.tradingPartnerId ?? "";
  const onboardingStatus = statusParam ?? lookup?.tradingPartnerStatus ?? "None";

  useEffect(() => {
    if (onboardingStatus === "DocumentsUploaded") {
      router.replace("/dashboard");
    }
  }, [onboardingStatus, router]);

  if (needsFetch && isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#185fa5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (onboardingStatus === "DocumentsUploaded") return null;

  return (
    <EntityOnboarding
      tradingPartnerId={tradingPartnerId}
      initialStatus={onboardingStatus}
      onComplete={() => router.replace("/dashboard")}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
