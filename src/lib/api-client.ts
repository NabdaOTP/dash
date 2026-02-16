// Direct API calls to the backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.nabdaotp.com";

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: Record<string, unknown> | null,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nadba-token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nadba-token");
      localStorage.removeItem("nadba-instance");
      document.cookie = "nadba-token=; path=/; max-age=0";
    }
    throw new ApiError(401, null, "Unauthorized");
  }

  let data: unknown = null;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    const errorData = data as Record<string, unknown> | null;
    const message =
      (errorData?.message as string) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, errorData, message);
  }

  // API wraps success responses in { success: true, data: { ... } } — unwrap
  const parsed = data as Record<string, unknown>;
  if (
    parsed &&
    typeof parsed === "object" &&
    "success" in parsed &&
    "data" in parsed
  ) {
    return parsed.data as T;
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};
