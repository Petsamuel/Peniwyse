import { apiClient, type JsonValue } from "../api-client";

export async function lookupRespondent(rcNumber: string) {
  return apiClient("api/respondents/lookup", {
    body: { rcNumber },
  });
}

export async function submitRespondent(rcNumber: string) {
  return apiClient("api/respondents/submit", {
    body: { rcNumber },
  });
}

export async function getRespondents(params?: Record<string, string | number>) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }
  const queryStr = queryParams.toString();
  return apiClient(`api/respondents${queryStr ? `?${queryStr}` : ""}`);
}

export async function getComplianceQueue(params?: Record<string, string | number>) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }
  const queryStr = queryParams.toString();
  return apiClient(`api/respondents/compliance/queue${queryStr ? `?${queryStr}` : ""}`);
}

export async function refreshRespondent(rcNumber: string) {
  return apiClient(`api/respondents/by-rc/${rcNumber}/refresh`);
}

export async function uploadRespondentDocument(formData: FormData) {
  return apiClient("api/respondents/documents", {
    body: formData,
  });
}

export async function uploadShareholderDocument(formData: FormData) {
  return apiClient("api/respondents/shareholders/documents", {
    body: formData,
  });
}

export async function uploadDirectorDocument(formData: FormData) {
  return apiClient("api/respondents/directors/documents", {
    body: formData,
  });
}

export async function reviewRespondent(payload: { rcNumber: string, approvalStatus: string, note?: string, reviewedBy?: string }) {
  return apiClient("api/respondents/review", {
    body: payload,
  });
}

export async function uploadCompanyDocuments(payload: {
  companyId: string;
  documents: Array<{
    file: string;
    title: string;
    documentType: string;
    description: string;
  }>;
}) {
  return apiClient("api/respondents/documents", {
    body: payload,
  });
}

export async function submitRespondentManual(payload: unknown) {
  return apiClient("api/respondents/manual", {
    body: payload as JsonValue,
  });
}

export async function updateRespondentManual(companyId: string, payload: unknown) {
  return apiClient(`api/respondents/manual/${companyId}`, {
    method: "PUT",
    body: payload as JsonValue,
  });
}

export async function updateShareholder(shareholderId: string, payload: unknown) {
  return apiClient(`api/respondents/shareholders/${shareholderId}`, {
    method: "PUT",
    body: payload as JsonValue,
  });
}

export async function deleteShareholder(shareholderId: string) {
  return apiClient(`api/respondents/shareholders/${shareholderId}`, {
    method: "DELETE",
  });
}

export async function addDirector(companyId: string, payload: unknown) {
  return apiClient(`api/respondents/${companyId}/directors`, {
    method: "POST",
    body: payload as JsonValue,
  });
}

export async function updateDirector(directorId: string, payload: unknown) {
  return apiClient(`api/respondents/directors/${directorId}`, {
    method: "PUT",
    body: payload as JsonValue,
  });
}

export async function deleteDirector(directorId: string) {
  return apiClient(`api/respondents/directors/${directorId}`, {
    method: "DELETE",
  });
}

export async function getDocumentTypes() {
  return apiClient("api/document-types");
}
