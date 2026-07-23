'use client'

import { useCallback, useState } from "react";
import { ToastItem, ToastType } from "../components/disbursement/container";
import { genId } from "../components/disbursement/helpers";

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback(
    (type: ToastType, title: string, message?: React.ReactNode) => {
      setToasts((prev) => [...prev, { id: genId(), type, title, message }]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    dismiss,
    success: (title: string, msg?: React.ReactNode) => push("success", title, msg),
    error: (title: string, msg?: React.ReactNode) => push("error", title, msg),
    warning: (title: string, msg?: React.ReactNode) => push("warning", title, msg),
    info: (title: string, msg?: React.ReactNode) => push("info", title, msg),
  };
}
