"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdChevronRight,
} from "react-icons/md";
import { usePartnerLogin } from "@/app/hooks/use-onboarding";
import { useRole } from "@/app/context/role-context";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/disbursement/container";
import Image from "next/image";
import MarketPulse from "./market-pulse";

export default function LoginPage() {
  const router = useRouter();
  const { refreshFromToken } = useRole();
  const { mutate, isPending, error } = usePartnerLogin();
  const { toasts, dismiss, error: showError, success } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  let displayError = "";
  if (error) {
    displayError = (error as Error).message;
    try {
      const parsed = JSON.parse(displayError);
      if (parsed.message && parsed.message !== "Resource not found.") {
        displayError = parsed.message;
      } else if (parsed.errors && parsed.errors.length > 0) {
        displayError = parsed.errors[0];
      }
    } catch {
      // ignore
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { username: username.trim(), password },
      {
        onSuccess: (data) => {
          const token = data?.token?.access_token;
          const profile = data?.profile;
          const registration = data?.registration;
          if (token) {
            import('@/app/utils/auth').then(({ setClientToken }) => {
              setClientToken(token);
              if (profile) {
                sessionStorage.setItem("userProfile", JSON.stringify(profile));
              }
              if (registration) {
                sessionStorage.setItem("userRegistration", JSON.stringify(registration));
              } else {
                sessionStorage.removeItem("userRegistration");
              }
              refreshFromToken();
              success("Login Successful", "You will be redirected shortly.");
              router.replace("/onboarding-partner");
            });
          } else {
            success("Login Successful", "You will be redirected shortly.");
            router.replace("/onboarding-partner");
          }
        },
        onError: (err) => {
          let errMsg = err.message;
          try {
            const parsed = JSON.parse(err.message);
            if (parsed.message && parsed.message !== "Resource not found.") {
              errMsg = parsed.message;
            } else if (parsed.errors && parsed.errors.length > 0) {
              errMsg = parsed.errors[0];
            } else if (parsed.message) {
              errMsg = parsed.message;
            }
          } catch {
            // ignore
          }
          showError("Login Failed", errMsg);
        },
      },
    );
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-card-bg font-montserrat overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <MarketPulse />
      {/* RIGHT SIDE: Clean Login Form */}
      <div className="flex-1 bg-card-bg flex flex-col items-center justify-center p-4 lg:p-20 relative h-full">
        <div className="w-full max-w-xl flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="mb-10 font-montserrat">
            <>
              {/* Brand Logo - Top Left */}
              <div className="flex items-center gap-4 mb-10 group lg:hidden ">
                <div className="h-auto w-10 shrink-0 overflow-hidden flex items-center justify-center">
                  <Image
                    src={"/logo-white.png"}
                    alt="Logo"
                    width={200}
                    height={200}
                    className="h-full w-full object-contain scale-[1] translate-y-[2%]"
                  />
                </div>
                <span className="text-2xl font-black text-foreground tracking-tighter -ml-4">
                  TradeBlott<span className="text-[#1596fe] font-black">r</span>
                </span>
              </div>
            </>
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-muted-theme">
              Please enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground ml-1">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-card-bg border border-border-theme rounded-xl px-4 py-4 focus-within:border-[#1596fe] focus-within:ring-4 focus-within:ring-[#1596fe]/5 transition-all duration-300">
                <MdEmail className="text-muted-theme" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="flex-1 text-sm text-foreground placeholder-slate-300 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[9px] font-medium text-[#1596fe] capitalize tracking-widest hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex items-center gap-3 bg-card-bg border border-border-theme rounded-xl px-4 py-4 focus-within:border-[#1596fe] focus-within:ring-4 focus-within:ring-[#1596fe]/5 transition-all duration-300">
                <MdLock className="text-muted-theme" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="flex-1 text-sm text-foreground placeholder-slate-300 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-muted-theme hover:text-muted-theme transition-colors"
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl px-4 py-3">
                {displayError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || !username.trim() || !password}
              className="mt-4 w-full py-4.5 bg-[#1596fe] rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-[#0e7cdb] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-blue-500/10 active:scale-[0.98]"
            >
              {isPending ? "Authenticating..." : "Continue Onboarding"}
            </button>
          </form>

          {/* Help Footer */}
          <p className="mt-12 text-center text-[10px] text-muted-theme font-medium">
            Having trouble logging in?{" "}
            <button className="text-[#1596fe] font-bold hover:underline">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
