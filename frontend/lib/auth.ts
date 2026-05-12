// Auth service - handles all authentication-related API calls
// Token is now stored in httpOnly cookie (set by backend), NOT in localStorage
import { apiClient, ApiError } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  status: boolean;
  enabled: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  roles: string[];
}

export interface MeResponse {
  user: AuthUser;
  roles: string[];
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Backend sets httpOnly cookie automatically in the response
    const res = await apiClient.post<LoginResponse>("/auth/login", data);
    // Save user info and roles to localStorage (NOT the token — that's in httpOnly cookie)
    if (res.data.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("roles", JSON.stringify(res.data.roles));
    }
    return res.data;
  },

  async register(data: RegisterRequest): Promise<string> {
    const res = await apiClient.post<string>("/auth/register", data);
    return res.data;
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<string> {
    const res = await apiClient.post<string>("/auth/verify", data);
    return res.data;
  },

  async resendOtp(email: string): Promise<string> {
    const res = await apiClient.post<string>(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  async logout() {
    try {
      // Call backend to clear httpOnly cookie
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore errors during logout
    }
    // Clear local user info
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
  },

  /**
   * Fetch current authenticated user info from backend (validates cookie)
   */
  async getMe(): Promise<MeResponse | null> {
    try {
      const res = await apiClient.get<MeResponse>("/auth/me");
      // Update local cache
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("roles", JSON.stringify(res.data.roles));
      return res.data;
    } catch {
      // Not authenticated — clear stale local data
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
      return null;
    }
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getRoles(): string[] {
    if (typeof window === "undefined") return [];
    const roles = localStorage.getItem("roles");
    return roles ? JSON.parse(roles) : [];
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  },

  isAdmin(): boolean {
    return this.getRoles().includes("ROLE_ADMIN");
  },
};

// Helper to extract error message from API error
export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const apiError = error as ApiError;
    if (typeof apiError.data === "string") {
      return apiError.data;
    }
    if (typeof apiError.data === "object") {
      // Validation errors - return first error message
      const messages = Object.values(apiError.data);
      return messages.join(", ");
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
