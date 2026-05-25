// Base API configuration for communicating with Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  code: number;
  status: string;
  message?: string;
  data: T;
  timestamp?: string;
  meta?: unknown;
}

export interface ApiError {
  code: number;
  status: string;
  data: string | Record<string, string>;
  message?: string;
}

// ── HTTP Method Enum ─────────────────────────────────────────────────────────

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

const AUTH_SKIP_REFRESH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"] as const;

function shouldSkipRefresh(endpoint: string): boolean {
  return AUTH_SKIP_REFRESH_PATHS.some((path) => endpoint.startsWith(path));
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const locale = window.location.pathname.startsWith("/en") ? "en" : "vi";
  const loginPath = `/${locale}/auth/login`;
  if (!window.location.pathname.includes("/auth/login")) {
    window.location.href = loginPath;
  }
}

// ── API Client ───────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async parseResponse(res: Response): Promise<Record<string, unknown>> {
    const HTTP_NO_CONTENT = 204;
    if (res.status === HTTP_NO_CONTENT) return {};
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { data: text };
    }
  }

  private buildHeaders(isFormData: boolean): Record<string, string> {
    if (isFormData) return {};
    return { "Content-Type": "application/json" };
  }

  private buildBody(body?: unknown): BodyInit | undefined {
    if (!body) return undefined;
    if (body instanceof FormData) return body;
    return JSON.stringify(body);
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      url += `?${new URLSearchParams(params).toString()}`;
    }
    return url;
  }

  private async tryRefreshSession(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const res = await fetch(this.buildUrl("/auth/refresh"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          return res.ok;
        } catch {
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }
    return this.refreshPromise;
  }

  private async failSessionExpired(res: Response): Promise<never> {
    const { clearAuthCache } = await import("@/services/auth");
    clearAuthCache();
    redirectToLogin();
    const data = await this.parseResponse(res);
    throw {
      code: 401,
      status: "UNAUTHORIZED",
      data: (data.data as string) || "Session expired",
    } as ApiError;
  }

  private async request<T = unknown>(
    method: HttpMethod,
    endpoint: string,
    options?: { body?: unknown; params?: Record<string, string> },
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const isFormData = options?.body instanceof FormData;
    const url = this.buildUrl(endpoint, options?.params);

    const res = await fetch(url, {
      method,
      headers: this.buildHeaders(isFormData),
      credentials: "include",
      body: this.buildBody(options?.body),
    });

    if (res.status === 401 && !isRetry && !shouldSkipRefresh(endpoint)) {
      const refreshed = await this.tryRefreshSession();
      if (refreshed) {
        return this.request<T>(method, endpoint, options, true);
      }
      return this.failSessionExpired(res);
    }

    const data = await this.parseResponse(res);

    if (!res.ok) {
      throw {
        code: (data.code as number) || res.status,
        status: (data.status as string) || "ERROR",
        data: (data.data as string | Record<string, string>) || "An unexpected error occurred",
        message: data.message as string | undefined,
      } as ApiError;
    }

    return data as unknown as ApiResponse<T>;
  }

  get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.GET, endpoint, { params });
  }

  post<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.POST, endpoint, { body });
  }

  put<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.PUT, endpoint, { body });
  }

  delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.DELETE, endpoint);
  }

  patch<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.PATCH, endpoint, { body });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
