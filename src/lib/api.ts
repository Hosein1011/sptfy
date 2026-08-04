import { User } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

const TOKEN_KEY = "melora_api_token";

export class ApiError extends Error {
  status: number;
  fields?: unknown;

  constructor(message: string, status: number, fields?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};

type ApiOptions = RequestInit & { authenticated?: boolean };

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.authenticated !== false) {
    const token = tokenStorage.get();
    if (token) headers.set("Authorization", `Token ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = data?.error;
    const message =
      error?.message ||
      data?.detail ||
      Object.values(error?.fields || data || {}).flat().join(" ") ||
      "Request failed.";
    throw new ApiError(String(message), response.status, error?.fields);
  }

  return data as T;
}

export type AuthResponse = { token: string; user: User };

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthResponse>("/auth/login/", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({ email, password }),
    });
  },
  register(payload: {
    name: string;
    email: string;
    password: string;
    acceptedPrivacy: boolean;
  }) {
    return apiRequest<AuthResponse>("/auth/register/", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(payload),
    });
  },
  me() {
    return apiRequest<User>("/auth/me/");
  },
  logout() {
    return apiRequest<void>("/auth/logout/", { method: "POST" });
  },
  requestPasswordReset(email: string) {
    return apiRequest<{ message: string }>("/auth/password-reset/", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({ email }),
    });
  },
  confirmPasswordReset(payload: {
    uid: string;
    token: string;
    password: string;
    passwordConfirm: string;
  }) {
    return apiRequest<{ message: string }>("/auth/password-reset/confirm/", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(payload),
    });
  },
};
