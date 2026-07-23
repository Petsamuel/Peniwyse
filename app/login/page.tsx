"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { usePartnerLogin } from "@/app/hooks/use-onboarding";
import { useRole } from "@/app/context/role-context";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/disbursement/container";
import Link from "next/link";
import { Mascot } from "@/app/components/mascot";

export default function LoginPage() {
  const router = useRouter();
  const { refreshFromToken } = useRole();
  const { mutate, isPending, error } = usePartnerLogin();
  const { toasts, dismiss, error: showError, success } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
            import("@/app/utils/auth").then(({ setClientToken }) => {
              setClientToken(token);
              if (profile) {
                sessionStorage.setItem("userProfile", JSON.stringify(profile));
              }
              if (registration) {
                sessionStorage.setItem(
                  "userRegistration",
                  JSON.stringify(registration),
                );
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
    <div className="min-h-screen relative bg-[#f8fafc] font-montserrat flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Global Background SVGs */}
      <div
        className="absolute inset-0 z-0 mix-blend-multiply brightness-[0.9]"
        style={{
          backgroundImage: "url('/Background pattern.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute inset-0 z-0 mix-blend-multiply brightness-[0.2]"
        style={{
          backgroundImage: "url('/Map.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        {/* Left Side: Marketing Copy */}
        <div className="hidden lg:block flex-1 text-center lg:text-left text-slate-900 max-w-2xl mt-12 lg:mt-0">
          <h1 className="text-5xl lg:text-6xl xl:text-6xl font-bold tracking-tight mb-4 leading-[1.2]">
            Seamless Partner <span className="text-[#185fa5]">Onboarding</span>
            <br />& Compliance
          </h1>
          <p className="text-slate-600 text-sm lg:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 font-medium">
            Streamline your corporate onboarding. Peniwyse is a modern B2B
            compliance portal designed to securely manage identity verification,
            due diligence, and partner registrations with ease.
          </p>
        </div>

        {/* Right Side: Floating Login Card */}
        <div className="w-full max-w-lg relative mt-24 lg:mt-0 mx-auto">
          <Mascot isClosed={passwordFocused} />

          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 lg:p-10 shadow-2xl relative z-10 z-30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Login to Peniwyse
              </h2>
              <p className="text-sm text-slate-500 mb-2 font-medium">
                Welcome back, kindly login to continue your onboarding process.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="you@companymail.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10 rounded-xl pl-4 pr-16 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#3b82f6] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-4 py-3">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !username.trim() || !password}
                className="mt-2 w-full py-4 bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
              >
                {isPending ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer with Copyright and Compliance */}
      <div className="absolute bottom-4 lg:bottom-8 left-0 w-full text-center z-10 px-6">
        <p className="text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Peniwyse. All rights reserved.
          &middot;{" "}
          <Link href="#" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </Link>{" "}
          &middot;{" "}
          <Link href="#" className="hover:text-slate-600 transition-colors">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
