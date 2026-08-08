import {
  Album,
  Gender,
  HomeResponse,
  Notification,
  PaginatedResponse,
  Playlist,
  Song,
  User,
} from "../types";

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
    const fields = error?.fields || data;
    const flatValues = fields && typeof fields === "object"
      ? Object.values(fields).flat().map(String)
      : [];
    const message =
      error?.message || data?.detail || flatValues.join(" ") || "Request failed.";
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
    passwordConfirm?: string;
    birthDate?: string | null;
    gender?: Gender;
    acceptedPrivacy: boolean;
  }) {
    return apiRequest<AuthResponse>("/auth/register/", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(payload),
    });
  },
  registerArtist(payload: {
    stageName: string;
    email: string;
    password: string;
    sampleWorkUrl?: string;
    sampleWorkFile?: File | null;
    bio?: string;
  }) {
    const form = new FormData();
    form.append("stageName", payload.stageName);
    form.append("email", payload.email);
    form.append("password", payload.password);
    if (payload.sampleWorkUrl) form.append("sampleWorkUrl", payload.sampleWorkUrl);
    if (payload.sampleWorkFile) form.append("sampleWorkFile", payload.sampleWorkFile);
    if (payload.bio) form.append("bio", payload.bio);
    return apiRequest<AuthResponse>("/auth/register/artist/", {
      method: "POST",
      authenticated: false,
      body: form,
    });
  },
  me() {
    return apiRequest<User>("/auth/me/");
  },
  updateMe(payload: {
    name?: string;
    birth_date?: string | null;
    gender?: Gender;
    bio?: string;
    profile_image?: File | null;
  }) {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.birth_date !== undefined) form.append("birth_date", payload.birth_date || "");
    if (payload.gender !== undefined) form.append("gender", payload.gender);
    if (payload.bio !== undefined) form.append("bio", payload.bio);
    if (payload.profile_image) form.append("profile_image", payload.profile_image);
    return apiRequest<User>("/auth/me/", { method: "PATCH", body: form });
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

export const homeApi = {
  get() {
    return apiRequest<HomeResponse>("/home/");
  },
};

export const usersApi = {
  get(id: string) {
    return apiRequest<User>(`/users/${id}/`);
  },
  list(params: { role?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    if (params.search) query.set("search", params.search);
    const suffix = query.toString() ? `?${query}` : "";
    return apiRequest<PaginatedResponse<User>>(`/users/${suffix}`);
  },
  follow(id: string) {
    return apiRequest<{ following: boolean; targetId: string }>(`/users/${id}/follow/`, { method: "POST" });
  },
  unfollow(id: string) {
    return apiRequest<void>(`/users/${id}/unfollow/`, { method: "DELETE" });
  },
};

export const songsApi = {
  list(params: { search?: string; sortBy?: "listeners" | "releaseDate"; artist?: string; album?: string; page_size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.artist) query.set("artist", params.artist);
    if (params.album) query.set("album", params.album);
    if (params.page_size) query.set("page_size", String(params.page_size));
    const suffix = query.toString() ? `?${query}` : "";
    return apiRequest<PaginatedResponse<Song>>(`/songs/${suffix}`);
  },
  get(id: string) {
    return apiRequest<Song>(`/songs/${id}/`);
  },
  stream(id: string, secondsPlayed = 0) {
    return apiRequest<{ streamId: string; remaining: number | null }>(`/songs/${id}/stream/`, {
      method: "POST",
      body: JSON.stringify({ secondsPlayed }),
    });
  },
  like(id: string) {
    return apiRequest<{ liked: boolean }>(`/songs/${id}/like/`, { method: "POST" });
  },
  unlike(id: string) {
    return apiRequest<void>(`/songs/${id}/unlike/`, { method: "DELETE" });
  },
};

export const albumsApi = {
  list(params: { search?: string; ordering?: string; sortBy?: "listeners" | "releaseDate"; artist?: string; page_size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.ordering) query.set("ordering", params.ordering);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.artist) query.set("artist", params.artist);
    if (params.page_size) query.set("page_size", String(params.page_size));
    const suffix = query.toString() ? `?${query}` : "";
    return apiRequest<PaginatedResponse<Album>>(`/albums/${suffix}`);
  },
  get(id: string) {
    return apiRequest<Album>(`/albums/${id}/`);
  },
};

export const playlistsApi = {
  list(params: { owner?: string; search?: string; page_size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.owner) query.set("owner", params.owner);
    if (params.search) query.set("search", params.search);
    if (params.page_size) query.set("page_size", String(params.page_size));
    const suffix = query.toString() ? `?${query}` : "";
    return apiRequest<PaginatedResponse<Playlist>>(`/playlists/${suffix}`);
  },
  create(payload: { name: string; description?: string; is_public?: boolean }) {
    return apiRequest<Playlist>("/playlists/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<Pick<Playlist, "name" | "description" | "is_public">>) {
    return apiRequest<Playlist>(`/playlists/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  remove(id: string) {
    return apiRequest<void>(`/playlists/${id}/`, { method: "DELETE" });
  },
  addSong(id: string, songId: string) {
    return apiRequest<Playlist>(`/playlists/${id}/songs/`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  },
  removeSong(id: string, songId: string) {
    return apiRequest<void>(`/playlists/${id}/songs/${songId}/`, { method: "DELETE" });
  },
};

export const notificationsApi = {
  list() {
    return apiRequest<PaginatedResponse<Notification>>("/notifications/?page_size=100");
  },
  markRead(id: string) {
    return apiRequest<Notification>(`/notifications/${id}/mark_read/`, { method: "POST" });
  },
  markAllRead() {
    return apiRequest<{ updated: number }>("/notifications/mark_all_read/", { method: "POST" });
  },
  remove(id: string) {
    return apiRequest<void>(`/notifications/${id}/`, { method: "DELETE" });
  },
  clearAll() {
    return apiRequest<{ deleted: number }>("/notifications/clear_all/", { method: "DELETE" });
  },
};
