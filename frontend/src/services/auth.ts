// Auth service - handles all authentication-related API calls
// Token is now stored in httpOnly cookie (set by backend), NOT in sessionStorage
import { apiClient, ApiError } from "@/lib/api";
import { UserRole } from "@/constants/enums";

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

export function clearAuthCache(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("roles");
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Backend sets httpOnly cookie automatically in the response
    const res = await apiClient.post<LoginResponse>("/auth/login", data);
    // Save user info and roles to sessionStorage (NOT the token — that's in httpOnly cookie)
    if (res.data.user) {
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("roles", JSON.stringify(res.data.roles));
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
    clearAuthCache();
  },

  /**
   * Fetch current authenticated user info from backend (validates cookie)
   */
  async getMe(): Promise<MeResponse | null> {
    try {
      const res = await apiClient.get<MeResponse>("/auth/me");
      // Update local cache
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("roles", JSON.stringify(res.data.roles));
      return res.data;
    } catch {
      clearAuthCache();
      return null;
    }
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getRoles(): string[] {
    if (typeof window === "undefined") return [];
    const roles = sessionStorage.getItem("roles");
    return roles ? JSON.parse(roles) : [];
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  },

  isAdmin(): boolean {
    return this.getRoles().includes(UserRole.ADMIN);
  },
};

// Helper to extract error message from API error
export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    // Check if the actual message is present in the "message" field
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.code === 400 || apiError.status === "400" || apiError.status === "BAD_REQUEST") {
        if (apiError.data && typeof apiError.data === 'string' && apiError.data !== "An unexpected error occurred") {
            return apiError.data;
        }
    }
    if ("data" in error && apiError.data) {
      if (typeof apiError.data === "string" && apiError.data !== "An unexpected error occurred") {
        return apiError.data;
      }
      if (typeof apiError.data === "object") {
        // Validation errors - return first error message
        const messages = Object.values(apiError.data);
        if (messages.length > 0) return messages.join(", ");
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
