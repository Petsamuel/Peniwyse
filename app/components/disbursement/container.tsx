import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { SingleToast } from "./single-toast";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: React.ReactNode;
}

export interface UploadedFile {
  file: File;
  id: string;
}

export const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> =
  {
    Approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    Pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-400",
    },
    Rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
    Completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    Failed: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
  };

export const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    bar: string;
    iconBg: string;
    border: string;
  }
> = {
  success: {
    icon: <FiCheckCircle className="w-4 h-4 text-emerald-600" />,
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    border: "border-border-theme",
  },
  error: {
    icon: <FiAlertCircle className="w-4 h-4 text-red-600" />,
    bar: "bg-red-500",
    iconBg: "bg-red-50 text-red-600",
    border: "border-border-theme",
  },
  warning: {
    icon: <FiAlertCircle className="w-4 h-4 text-amber-600" />,
    bar: "bg-amber-400",
    iconBg: "bg-amber-50 text-amber-600",
    border: "border-border-theme",
  },
  info: {
    icon: <FiInfo className="w-4 h-4 text-indigo-600" />,
    bar: "bg-indigo-500",
    iconBg: "bg-indigo-50 text-indigo-600",
    border: "border-border-theme",
  },
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-9999 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
