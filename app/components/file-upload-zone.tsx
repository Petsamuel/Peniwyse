import React, { useCallback, useRef, useState } from "react";
import { MdUploadFile, MdInsertDriveFile, MdDelete } from "react-icons/md";

const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

function fmtBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface FileError {
  name: string;
  reason: string;
}

interface UploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function FileUploadZone({ files, onChange, error }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArr = Array.from(incoming);
      const rejected: FileError[] = [];
      const valid: File[] = [];

      for (const file of incomingArr) {
        if (!ACCEPTED_MIME.includes(file.type)) {
          rejected.push({ name: file.name, reason: "Unsupported file type." });
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          rejected.push({ name: file.name, reason: "Exceeds 5 MB limit." });
          continue;
        }
        if (files.length + valid.length >= MAX_FILES) {
          rejected.push({ name: file.name, reason: `Max ${MAX_FILES} files.` });
          continue;
        }
        const isDupe = files.some(
          (f) => f.name === file.name && f.size === file.size,
        );
        if (!isDupe) valid.push(file);
      }

      setFileErrors(rejected);
      if (valid.length > 0) onChange([...files, ...valid]);
    },
    [files, onChange],
  );

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 cursor-pointer transition-all select-none ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : error
              ? "border-red-400 bg-red-50/30"
              : "border-border-theme bg-surface-hover/50 hover:border-blue-400 hover:bg-blue-50/20 shadow-inner"
        }`}
      >
        <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-50 dark:bg-blue-900/30 text-accent' : 'bg-surface-hover text-muted-theme'}`}>
            <MdUploadFile size={28} />
        </div>
        <p className="text-xs font-bold text-foreground">
          Drag & drop files here, or <span className="text-accent">browse</span>
        </p>
        <p className="text-[10px] text-muted-theme font-medium">
          PDF, JPG, PNG, WEBP · Max 5 MB · Up to {MAX_FILES} files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-[10px] font-medium text-red-500 ml-1">{error}</p>}

      {fileErrors.length > 0 && (
        <ul className="flex flex-col gap-1 px-1">
          {fileErrors.map((fe, i) => (
            <li key={i} className="text-[10px] text-red-500 flex items-center gap-1.5 font-medium">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              <span className="font-bold">{fe.name}:</span> {fe.reason}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 bg-card-bg border border-border-theme rounded-xl px-4 py-2.5 shadow-sm animate-in slide-in-from-top-1 duration-150"
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <MdInsertDriveFile size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-bold truncate">{f.name}</p>
                <p className="text-[10px] text-muted-theme font-medium">{fmtBytes(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="p-1.5 text-muted-theme hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <MdDelete size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
