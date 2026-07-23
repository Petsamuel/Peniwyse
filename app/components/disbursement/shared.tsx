'use client'

import { useCallback, useRef, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiFile, FiUploadCloud, FiX } from "react-icons/fi";
import { MdArrowDropDown } from "react-icons/md";
import { STATUS_CONFIG, UploadedFile } from "./container";
import { formatBytes, MAX_FILE_SIZE_MB } from "./helpers";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-card-bg rounded-xl border border-border-theme/80 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
      <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  ) : null;

export const LabelValue = ({
  label,
  value,
  mono = false,
  accent = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-muted-theme tracking-wider">
      {label}
    </span>
    <span
      className={`text-sm font-medium leading-snug
        ${mono ? "font-mono" : ""}
        ${accent ? "text-indigo-600 text-base font-semibold" : "text-foreground"}`}
    >
      {value}
    </span>
  </div>
);

export const SelectField = ({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2.5 appearance-none bg-surface-hover
          text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500
          focus:border-transparent focus:bg-card-bg transition
          ${
            error
              ? "border-red-400 bg-red-50/30 focus:ring-red-400"
              : "border-border-theme"
          }`}
      >
        <option value="">— Select payment type —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>
      <MdArrowDropDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-theme pointer-events-none" />
    </div>
    <FieldError message={error} />
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    bg: "bg-surface-hover",
    text: "text-muted-theme",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

export const NotApprovedBanner = ({
  status,
  requisitionId,
}: {
  status: string;
  requisitionId: string;
}) => {
  const isRejected = status === "Rejected";
  return (
    <Card className="py-12 px-6 flex flex-col items-center text-center gap-4">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center
          ${isRejected ? "bg-red-50" : "bg-amber-50"}`}
      >
        <FiAlertCircle
          className={`w-8 h-8 ${isRejected ? "text-red-400" : "text-amber-400"}`}
        />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">
          Requisition {isRejected ? "Rejected" : "Pending Approval"}
        </h3>
        <p className="text-muted-theme text-sm mt-1 max-w-md">
          Requisition{" "}
          <span
            className={`font-mono font-semibold
              ${isRejected ? "text-red-500" : "text-amber-500"}`}
          >
            {requisitionId}
          </span>{" "}
          has a status of{" "}
          <span
            className={`font-semibold
              ${isRejected ? "text-red-600" : "text-amber-600"}`}
          >
            {status}
          </span>
          . Only{" "}
          <span className="font-semibold text-emerald-600">Approved</span>{" "}
          requisitions can be disbursed.
        </p>
      </div>
      <StatusBadge status={status} />
    </Card>
  );
};

export const FileUploadZone = ({
  files,
  onAdd,
  onRemove,
  error,
}: {
  files: UploadedFile[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
  error?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
    },
    [onAdd],
  );

  return (
    <div>
      <FieldLabel>
        Supporting Documents{" "}
        <span className="normal-case font-normal text-muted-theme">
          (optional)
        </span>
      </FieldLabel>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all
          duration-200 p-6 flex flex-col items-center justify-center gap-3 text-center
          ${
            dragging
              ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
              : error
                ? "border-red-400 bg-red-50/30 hover:border-red-500"
                : "border-border-theme bg-surface-hover hover:border-indigo-400 hover:bg-indigo-50/40"
          }`}
      >
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors
            ${
              dragging
                ? "bg-indigo-100"
                : error
                  ? "bg-red-50 border border-red-200"
                  : "bg-card-bg border border-border-theme"
            }`}
        >
          <FiUploadCloud
            className={`w-6 h-6 ${
              dragging
                ? "text-indigo-600"
                : error
                  ? "text-red-400"
                  : "text-muted-theme"
            }`}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop files here, or{" "}
            <span className="text-indigo-600 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-muted-theme mt-1">
            PDF, PNG, JPG, DOCX — max {MAX_FILE_SIZE_MB} MB each
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
          className="hidden"
          onChange={(e) => e.target.files && onAdd(e.target.files)}
        />
      </div>

      <FieldError message={error} />

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((uf) => (
            <li
              key={uf.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border-theme
                bg-card-bg hover:border-border-theme transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-500 shrink-0">
                <FiFile className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {uf.file.name}
                </p>
                <p className="text-xs text-muted-theme">
                  {formatBytes(uf.file.size)}
                </p>
              </div>
              <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <button
                type="button"
                onClick={() => onRemove(uf.id)}
                className="p-1 rounded-md text-muted-theme hover:text-red-500
                  hover:bg-red-50 transition-colors"
                title="Remove file"
              >
                <FiX className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Spinner = ({ className = "text-white" }: { className?: string }) => (
  <svg
    className={`animate-spin h-4 w-4 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);
