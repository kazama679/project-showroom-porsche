// User profile service - handles profile update and password change API calls
import { apiClient } from "@/lib/api";

export interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
  status: boolean;
  enabled: boolean;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>("/user/profile");
    return res.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>("/user/profile", data);
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<string> {
    const res = await apiClient.put<string>("/user/profile/change-password", data);
    return res.data;
  },
};
