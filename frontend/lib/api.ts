// Base API configuration for communicating with Spring Boot backend
const API_BASE_URL = "http://localhost:8080/api/v1";

export interface ApiResponse<T = any> {
  code: number;
  status: string;
  message?: string;
  data: T;
  timestamp?: string;
  meta?: any;
}

export interface ApiError {
  code: number;
  status: string;
  data: string | Record<string, string>;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async parseResponse(res: Response) {
    if (res.status === 204) return {};
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { data: text };
    }
  }

  private getHeaders(): Record<string, string> {
    // No longer need Authorization header — JWT is sent automatically via httpOnly cookie
    return {
      "Content-Type": "application/json",
    };
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    const headers = this.getHeaders();
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: headers,
      credentials: "include", // sends httpOnly cookie automatically
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    const data = await this.parseResponse(res);

    if (!res.ok) {
      const error: ApiError = {
        code: data.code || res.status,
        status: data.status || "ERROR",
        data: data.data || "An unexpected error occurred",
        message: data.message,
      };
      throw error;
    }

    return data as ApiResponse<T>;
  }

  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include", // sends httpOnly cookie automatically
    });

    const data = await this.parseResponse(res);

    if (!res.ok) {
      const error: ApiError = {
        code: data.code || res.status,
        status: data.status || "ERROR",
        data: data.data || "An unexpected error occurred",
        message: data.message,
      };
      throw error;
    }

    return data as ApiResponse<T>;
  }
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    const headers = this.getHeaders();
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: headers,
      credentials: "include", // sends httpOnly cookie automatically
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    const data = await this.parseResponse(res);

    if (!res.ok) {
      const error: ApiError = {
        code: data.code || res.status,
        status: data.status || "ERROR",
        data: data.data || "An unexpected error occurred",
        message: data.message,
      };
      throw error;
    }

    return data as ApiResponse<T>;
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include", // sends httpOnly cookie automatically
    });

    const data = await this.parseResponse(res);

    if (!res.ok) {
      const error: ApiError = {
        code: data.code || res.status,
        status: data.status || "ERROR",
        data: data.data || "An unexpected error occurred",
        message: data.message,
      };
      throw error;
    }

    return data as ApiResponse<T>;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
