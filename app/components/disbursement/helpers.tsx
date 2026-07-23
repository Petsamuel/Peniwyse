import { UploadedFile } from "./container";
import { Card } from "./shared";

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
export const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function fmtDate(dateStr: string): string {
  const parts = dateStr.split("-");

  if (parts.length !== 3) return "Invalid date";

  const [day, month, year] = parts.map(Number);

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);

  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, 
  });
}

export const getTimestamp = (dateStr: string | null | undefined): number | null => {
    if (!dateStr) return null;

    try {
        if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
            const [day, month, year] = dateStr.split('-');
            return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
        }

        const parsed = new Date(dateStr).getTime();
        return isNaN(parsed) ? null : parsed;
    } catch (e) {
        return null;
    }
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function validateFiles(files: UploadedFile[]): string | undefined {
  for (const uf of files) {
    const { file } = uf;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (
      !ALLOWED_MIME_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(ext)
    ) {
      return `"${file.name}" has an unsupported type. Allowed: PDF, PNG, JPG, DOCX.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`;
    }
  }
}

export const RequisitionSkeleton = () => (
  <Card className="p-6 animate-pulse">
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-gray-200" />
      <div className="h-4 w-40 rounded bg-gray-200" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />
        </div>
      ))}
    </div>
    <div className="border-t border-border-theme pt-6 grid grid-cols-2 md:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  </Card>
);
