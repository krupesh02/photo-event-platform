const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "bypass-tunnel-reminder": "true",
    "ngrok-skip-browser-warning": "true",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// ===== Auth =====
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    me: () => request<User>("/api/auth/me"),
  },

  // ===== Events =====
  events: {
    create: (data: { name: string; description?: string; eventDate?: string }) =>
      request<any>("/api/events/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    list: () => request<any[]>("/api/events/"),

    get: (id: string) => request<any>(`/api/events/${id}`),

    update: (id: string, data: any) =>
      request<any>(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<any>(`/api/events/${id}`, { method: "DELETE" }),
  },

  // ===== Photos =====
  photos: {
    upload: (eventId: string, file: File) => {
      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("file", file);
      return request<any>("/api/photos/upload", {
        method: "POST",
        body: formData,
      });
    },

    listByEvent: (eventId: string, page = 1, pageSize = 20) =>
      request<any>(`/api/photos/event/${eventId}?page=${page}&page_size=${pageSize}`),

    delete: (id: string) =>
      request<any>(`/api/photos/${id}`, { method: "DELETE" }),
  },

  // ===== Search =====
  search: {
    byFace: (file: File, eventId?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      if (eventId) formData.append("event_id", eventId);
      return request<any[]>("/api/search/face", {
        method: "POST",
        body: formData,
      });
    },
  },

  // ===== Public (No Auth Required) =====
  public: {
    getEvent: (id: string) => request<any>(`/api/events/${id}/public`),
    searchFace: (eventId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event_id", eventId);
      return request<any[]>("/api/search/public/face", {
        method: "POST",
        body: formData,
      });
    },
  },
};

