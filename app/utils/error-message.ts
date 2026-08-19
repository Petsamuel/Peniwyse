export interface ApiErrorResponse {
  response?: {
    data?: {
      errors?: string[] | Record<string, string[] | string>;
      message?: string;
      title?: string;
    };
  };
  errors?: string[] | Record<string, string[] | string>;
  message?: string;
  title?: string;
  code?: string;
}

function parseJsonSafe(str: string): unknown {
  if (typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function extractFromObject(obj: Record<string, unknown>): string | null {
  if (!obj || typeof obj !== "object") return null;

  // 1. If errors is an array of strings
  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    const validErrors = obj.errors.filter(
      (e): e is string => typeof e === "string" && e.trim().length > 0,
    );
    if (validErrors.length > 0) {
      return validErrors.join(". ");
    }
  }

  // 2. If errors is an object with validation errors (e.g. { Email: ["Invalid email"] })
  if (obj.errors && typeof obj.errors === "object" && !Array.isArray(obj.errors)) {
    const messages: string[] = [];
    for (const val of Object.values(obj.errors as Record<string, unknown>)) {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === "string" && item.trim()) {
            messages.push(item.trim());
          }
        }
      } else if (typeof val === "string" && val.trim()) {
        messages.push(val.trim());
      }
    }
    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  // 3. If message is a non-empty string
  if (typeof obj.message === "string" && obj.message.trim()) {
    return obj.message.trim();
  }

  // 4. If title or error is a non-empty string
  if (typeof obj.title === "string" && obj.title.trim()) {
    return obj.title.trim();
  }

  if (typeof obj.error === "string" && obj.error.trim()) {
    return obj.error.trim();
  }

  return null;
}

export const getApiErrorMessage = (err: unknown): string => {
  if (!err) return "An unexpected error occurred";

  // Case 1: err is a string
  if (typeof err === "string") {
    const parsed = parseJsonSafe(err);
    if (parsed && typeof parsed === "object") {
      const extracted = extractFromObject(parsed as Record<string, unknown>);
      if (extracted) return extracted;
    }
    return err;
  }

  // Case 2: err is an object
  if (typeof err === "object") {
    const errorObj = err as Record<string, unknown>;

    // Check Axios-like error: error.response.data
    if (errorObj.response && typeof errorObj.response === "object") {
      const resp = errorObj.response as Record<string, unknown>;
      if (resp.data) {
        if (typeof resp.data === "object") {
          const extracted = extractFromObject(resp.data as Record<string, unknown>);
          if (extracted) return extracted;
        } else if (typeof resp.data === "string") {
          const parsed = parseJsonSafe(resp.data);
          if (parsed && typeof parsed === "object") {
            const extracted = extractFromObject(parsed as Record<string, unknown>);
            if (extracted) return extracted;
          }
          return resp.data;
        }
      }
    }

    // Check direct properties on the error object
    const directExtracted = extractFromObject(errorObj);
    if (directExtracted && directExtracted !== errorObj.message) {
      return directExtracted;
    }

    // Check error.message (Standard Error)
    if (typeof errorObj.message === "string" && errorObj.message.trim()) {
      const parsed = parseJsonSafe(errorObj.message);
      if (parsed && typeof parsed === "object") {
        const extracted = extractFromObject(parsed as Record<string, unknown>);
        if (extracted) return extracted;
      }
      return errorObj.message.trim();
    }
  }

  return "An unexpected error occurred";
};