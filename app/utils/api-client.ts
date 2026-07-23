import { getClientToken, clearClientToken } from "./auth";


const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://otc.etechnosoft.org";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

interface CustomConfig extends Omit<RequestInit, "body"> {
  body?: JsonValue | FormData; // ← widened
  token?: string | null;
}

export async function apiClient(
  endpoint: string,
  { body, token, ...customConfig }: CustomConfig = {},
) {
  const isBrowser = typeof window !== "undefined";
  const authToken = token ?? (isBrowser ? getClientToken() : null);
  const isMultipart = body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isMultipart && { "content-type": "application/json" }),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    cache: "no-store",
    ...customConfig,
    headers: {
      ...headers,
      ...(customConfig.headers as Record<string, string>),
    },
  };

  if (body) {
    config.body = isMultipart ? body : JSON.stringify(body);
  }

  const base = (baseUrl ?? "").replace(/\/$/, "");
  const response = await fetch(`${base}/${endpoint}`, config);

  if (response.status === 401) {
    if (isBrowser) {
      clearClientToken();
      
      // Do not redirect if we are already on a public path
      const publicPaths = ['/login', '/tradingpartner-form', '/invite'];
      const isPublicPath = publicPaths.some(p => window.location.pathname.startsWith(p));
      
      if (!isPublicPath) {
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Something went wrong");
  }

  return response.json();
}
