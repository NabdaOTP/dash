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

export type TokenScope = "user" | "instance";

function getToken(scope: TokenScope = "user"): string | null {
  if (typeof window === "undefined") return null;
  if (scope === "instance") {
    return localStorage.getItem("nadba-instance-token");
  }
  return localStorage.getItem("nadba-token");
}

export interface RequestOptions extends RequestInit {
  /** Use instance-scoped token (from select-instance). Default "user". */
  tokenScope?: TokenScope;
}

async function request<T>(endpoint: string,options: RequestOptions = {},): Promise<T> {
  const { tokenScope = "user", ...fetchInit } = options;
  const token = getToken(tokenScope);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchInit.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (fetchInit.body == null) {
    delete headers["Content-Type"];
  }
  // for debugging
  console.log("API Request:", {
    url: `${API_URL}${endpoint}`,
    method: fetchInit.method || "GET",
    headers,
    body: fetchInit.body ? JSON.parse(fetchInit.body as string) : null,
  });

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchInit,
    headers,
    
  });
  // for devuggin
  console.log("API Response:", {
    status: res.status,
    statusText: res.statusText,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      if (tokenScope === "instance") {
        localStorage.removeItem("nadba-instance-token");
        localStorage.removeItem("nadba-instance");
        document.cookie = "nadba-instance-token=; path=/; max-age=0";
      } else {
        localStorage.removeItem("nadba-token");
        localStorage.removeItem("nadba-instance");
        localStorage.removeItem("nadba-instance-token");
        document.cookie = "nadba-token=; path=/; max-age=0";
        document.cookie = "nadba-instance-token=; path=/; max-age=0";
      }
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
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
