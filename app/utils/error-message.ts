export interface ApiErrorResponse {
  response?: {
    data?: {
      errors?: string[];
      message?: string;
    };
  };
  message?: string;
}

export const getApiErrorMessage = (err: unknown): string => {
  const error = err as ApiErrorResponse;

  const errorData = error?.response?.data;

  if (errorData?.errors && errorData.errors.length > 0) {
    return errorData.errors[0];
  }

  if (errorData?.message) {
    return errorData.message;
  }

  return error?.message || "An unexpected error occurred";
};