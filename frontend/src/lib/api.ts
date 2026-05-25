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

// ── API Client ───────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

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
    // No Authorization header — JWT is sent automatically via httpOnly cookie
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

  // ── Generic Request ──────────────────────────────────────────────────────

  private async request<T = unknown>(
    method: HttpMethod,
    endpoint: string,
    options?: { body?: unknown; params?: Record<string, string> },
  ): Promise<ApiResponse<T>> {
    const isFormData = options?.body instanceof FormData;
    const url = this.buildUrl(endpoint, options?.params);

    const res = await fetch(url, {
      method,
      headers: this.buildHeaders(isFormData),
      credentials: "include", // sends httpOnly cookie automatically
      body: this.buildBody(options?.body),
    });

    const data = await this.parseResponse(res);

    if (!res.ok) {
      const error: ApiError = {
        code: (data.code as number) || res.status,
        status: (data.status as string) || "ERROR",
        data: (data.data as string | Record<string, string>) || "An unexpected error occurred",
        message: data.message as string | undefined,
      };
      throw error;
    }

    return data as unknown as ApiResponse<T>;
  }

  // ── Public Methods ───────────────────────────────────────────────────────

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

// ── Singleton Export ─────────────────────────────────────────────────────────

export const apiClient = new ApiClient(API_BASE_URL);
