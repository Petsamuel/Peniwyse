'use client'
 
import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_CONFIG, ToastItem } from "./container";
import { FiX } from "react-icons/fi";

const TOAST_DURATION = 5000;

export function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const cfg = TOAST_CONFIG[toast.type];
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  // Countdown progress bar → auto-dismiss
  useEffect(() => {
    startRef.current = Date.now();
    function tick() {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        handleClose();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [handleClose]);

  return (
    <div
      className={`relative flex items-start gap-3 w-80 bg-card-bg rounded-xl border shadow-lg shadow-black/5
        px-4 pt-3.5 pb-3 overflow-hidden transition-all duration-300 ease-out
        ${cfg.border}
        ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
    >
      {/* Left accent bar */}
      <span
        className={`absolute left-0 inset-y-0 w-0.75 rounded-l-xl ${cfg.bar}`}
      />

      {/* Icon */}
      <div
        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${cfg.iconBg}`}
      >
        {cfg.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-sm font-semibold text-foreground leading-snug">
          {toast.title}
        </p>
        {toast.message && (
          <div className="text-xs text-muted-theme mt-0.5 leading-relaxed">
            {toast.message}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        className="shrink-0 mt-0.5 p-1 rounded-md text-muted-theme
          hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        <FiX className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-hover">
        <div
          className={`h-full transition-none ${cfg.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}