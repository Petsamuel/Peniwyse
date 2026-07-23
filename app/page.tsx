"use client";

import { useRole, ROLES } from "@/app/context/role-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/app/components/loader";

export default function Home() {
  const { role, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (role === ROLES.MARKETER || role === ROLES.MARKETERS) {
        router.replace("/onboarding");
      } else if (role === ROLES.AUDIT) {
        router.replace("/sales");
      } else if (role === ROLES.COMPLIANCE) {
        router.replace("/trading-partners");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [role, isLoading, router]);

  return <Loader />;
}
