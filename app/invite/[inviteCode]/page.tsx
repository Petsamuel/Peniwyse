"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdVisibility, MdVisibilityOff, MdInfoOutline, MdCheckCircle, MdBlock } from "react-icons/md";
import { useTheme } from "@/app/context/theme-context";
import {
  useValidateInvite,
  useRegisterInvite,
} from "@/app/hooks/use-onboarding";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/disbursement/container";

export default function InvitePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const resolvedParams = use(params);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setTheme } = useTheme();
  const router = useRouter();
  const { toasts, dismiss, error: showError } = useToast();

  const inviteCode = resolvedParams.inviteCode;
  const { data: inviteValidation, isLoading: isValidating } =
    useValidateInvite(inviteCode);
  const registerMutation = useRegisterInvite();

  const isValidInvite = inviteValidation?.isValid ?? null;
  const inviteStatus = inviteValidation?.status ?? '';
  const invalidReason = inviteValidation?.reason ?? '';
  const isAlreadyUsed = !isValidating && inviteStatus.toLowerCase() === 'accepted' && isValidInvite === false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !accountType ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !inviteCode
    )
      return;

    if (password !== confirmPassword) {
      showError("Passwords do not match", "Please ensure both passwords match.");
      return;
    }

    registerMutation.mutate(
      {
        inviteCode,
        password,
        email,
        firstName,
        lastName,
        businessType: accountType,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
        onError: (err) => {
          console.error("Registration failed:", err);
        },
      },
    );
  };

  // Force light mode on the invite page since it matches the premium aesthetic
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  // Countdown auto-redirect after success
  useEffect(() => {
    if (!showSuccess) return;
    // Reset countdown via the functional updater to avoid a synchronous setState
    // in the effect body (which causes cascading renders). Since countdown is
    // already initialised to 5, this only matters when the effect re-runs.
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Ensure the displayed value is 5 whenever the success screen appears,
    // using a queueMicrotask so it is not synchronous within the effect body.
    queueMicrotask(() => setCountdown(5));
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showSuccess, router]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".custom-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const accountOptions = [
    {
      value: "business",
      label: "Business Account",
      description: "Create an account for your business and operations",
    },
    // {
    //   value: "personal",
    //   label: "Personal Account",
    //   description: "Create an account for personal use",
    // },
  ];

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length === 0) return 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength === 0 && pwd.length > 0 ? 1 : strength;
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = (index: number) => {
    if (index >= strength) return "bg-border-theme";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    if (strength === 4) return "bg-[#00c04b]";
    return "bg-border-theme";
  };

  return (
    <div className="w-full max-w-xl lg:max-w-2xl mx-auto p-8 sm:p-10 min-h-screen flex flex-col justify-center">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Header section */}
      <div className="flex flex-col items-center mb-2">
        {/* <div className="w-16 h-16  flex items-center justify-center mb-4 relative overflow-hidden">
          <Image
            src="/logo-white.png"
            alt="TradeBlottr Logo"
            fill
            className="object-contain p-3.5"
          />
        </div> */}
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2 text-center tracking-tight">
          Get Started with <br /> TradeBlottr
        </h1>
        {/* <p className="text-muted-theme text-sm mb-4 text-center">
          Create your account to begin
        </p> */}
        <p className="text-sm text-foreground text-center">
          Have questions? Check out our{" "}
          <Link
            href="/faqs"
            className="text-accent font-semibold hover:underline"
          >
            FAQs
          </Link>
        </p>

        {/* Already-used banner */}
        {isAlreadyUsed && (
          <div className="w-full my-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left">
            <MdBlock size={22} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-bold text-sm">Invite Already Used</p>
              <p className="text-amber-600 text-xs mt-0.5">
                This invite link has already been accepted and cannot be used again. Please contact your administrator for a new invite.
              </p>
            </div>
          </div>
        )}

        {/* Generic invalid banner */}
        {!isValidating && isValidInvite === false && !isAlreadyUsed && (
          <div className="w-full my-3 py-2 px-4 bg-red-100 text-red-600 rounded-xl text-center text-sm font-medium">
            {invalidReason || "Invite url supplied is invalid. Please contact support."}
          </div>
        )}
      </div>

      {/* Form section */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Account Type */}
        <div className="space-y-2 mt-6">
          <label className="block text-[13px] font-semibold text-foreground">
            Please choose your account type to begin
          </label>
          <div className="relative custom-dropdown">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full h-12 px-4 bg-white rounded-xl text-sm flex items-center justify-between transition-all ${
                isDropdownOpen
                  ? "border-2 border-accent ring-2 ring-accent/20 text-foreground"
                  : "border-2 border-slate-200 hover:border-slate-300 text-foreground"
              }`}
            >
              <span
                className={
                  accountType ? "text-foreground" : "text-muted-theme/60"
                }
              >
                {accountType
                  ? accountOptions.find((o) => o.value === accountType)?.label
                  : "Choose One"}
              </span>
              <svg
                className={`w-4 h-4 text-muted-theme transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-border-theme rounded-xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {accountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setAccountType(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 hover:bg-surface-hover transition-colors ${
                      accountType === opt.value ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="text-sm font-semibold text-foreground mb-0.5">
                      {opt.label}
                    </div>
                    <div className="text-xs text-muted-theme">
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-foreground">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-12 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl text-foreground placeholder-muted-theme/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-foreground">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-12 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl text-foreground placeholder-muted-theme/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-sm"
            />
          </div>
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <label className="flex items-center text-[13px] font-semibold text-foreground group w-fit relative cursor-help">
            Email address
            <MdInfoOutline
              className="ml-1.5 text-muted-theme group-hover:text-foreground transition-colors"
              size={15}
            />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-800 text-white font-normal text-xs leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 text-center shadow-xl">
              This email will be used to log in and complete your onboarding
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
            </div>
          </label>
          <input
            type="email"
            placeholder="hello@johndoe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl text-foreground placeholder-muted-theme/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-sm"
          />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label className="flex items-center text-[13px] font-semibold text-foreground group w-fit relative cursor-help">
            Password
            <MdInfoOutline
              className="ml-1.5 text-muted-theme group-hover:text-foreground transition-colors"
              size={15}
            />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-800 text-white font-normal text-xs leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 text-center shadow-xl">
              This password will be used to log in and complete your onboarding
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
            </div>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl text-foreground placeholder-muted-theme/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-muted-theme hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <MdVisibilityOff size={20} />
              ) : (
                <MdVisibility size={20} />
              )}
            </button>
          </div>

          {/* Password strength segments */}
          <div className="flex gap-2 pt-2 pb-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(0)}`}
            ></div>
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(1)}`}
            ></div>
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(2)}`}
            ></div>
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(3)}`}
            ></div>
          </div>
          <p className="text-[11px] text-muted-theme font-medium">
            Use at least 8 characters.
          </p>
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-foreground">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl text-foreground placeholder-muted-theme/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-muted-theme hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <MdVisibilityOff size={20} />
              ) : (
                <MdVisibility size={20} />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-red-500 font-medium pt-1">
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={
              isValidating ||
              isValidInvite === false ||
              isAlreadyUsed ||
              registerMutation.isPending ||
              (password !== confirmPassword)
            }
            className={`w-full h-12 text-white font-bold rounded-xl transition-colors flex items-center justify-center text-sm ${
              isValidating ||
              isValidInvite === false ||
              isAlreadyUsed ||
              registerMutation.isPending ||
              (password !== confirmPassword)
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
            }`}
          >
            {isValidating
              ? "Validating invite..."
              : registerMutation.isPending
                ? "Creating account..."
                : isAlreadyUsed
                  ? "Invite unavailable"
                  : "Create account"}
          </button>
        </div>

        {/* Footer text */}
        <div className="pt-4 text-center">
          <p className="text-[11px] text-muted-theme leading-relaxed">
            By creating your account, you confirm that you have read and
            understood <br className="hidden sm:block" />
            our{" "}
            <Link
              href="/privacy"
              className="text-accent font-semibold hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            and agree to our{" "}
            <Link
              href="/terms"
              className="text-accent font-semibold hover:underline"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </form>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

            <div className="px-8 py-8 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="flex items-center justify-center mb-6 bg-white rounded-full">
                <MdCheckCircle size={84} className="text-[#00c04b]" />
              </div>

              <h2 className="text-[26px] font-extrabold text-slate-800 mb-3 tracking-tight">
                Account Created!
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-6 px-1">
                Your TradeBlottr account has been created successfully. Log in to complete your onboarding.
              </p>

              {/* Countdown — same style as idle modal */}
              <div className="py-4 flex justify-center items-center flex-col mb-4">
                <div className="text-6xl font-black text-accent tabular-nums">
                  {countdown}
                </div>
                <div className="text-base text-muted-theme mt-1">seconds</div>
              </div>

              <button
                onClick={() => {
                  if (countdownRef.current) clearInterval(countdownRef.current);
                  router.push("/login");
                }}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/25 active:scale-95 text-sm"
              >
                Go to Login now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
