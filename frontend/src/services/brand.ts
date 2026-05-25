// Brand service - handles all brand-related API calls
import { apiClient } from "@/lib/api";

export interface Brand {
  id: number;
  name: string;
  country: string;
  logoUrl: string | null;
}

export interface BrandFormData {
  name: string;
  country: string;
  logo?: File | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const brandService = {
  /**
   * Get all brands with pagination and search
   */
  async findAll(keyword: string = "", page: number = 0, size: number = 10): Promise<PageResponse<Brand>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<Brand>>("/brands", params);
    return res.data;
  },

  /**
   * Get a single brand by ID
   */
  async findById(id: number): Promise<Brand> {
    const res = await apiClient.get<Brand>(`/brands/${id}`);
    return res.data;
  },

  /**
   * Create a new brand (requires ADMIN role)
   */
  async create(data: BrandFormData): Promise<string> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('country', data.country);
    if (data.logo) {
      formData.append('logo', data.logo);
    }
    const res = await apiClient.post<string>("/brands", formData);
    return res.data;
  },

  /**
   * Update an existing brand (requires ADMIN role)
   */
  async update(id: number, data: BrandFormData): Promise<string> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('country', data.country);
    if (data.logo) {
      formData.append('logo', data.logo);
    }
    const res = await apiClient.post<string>(`/brands/${id}`, formData);
    return res.data;
  },

  /**
   * Delete a brand (requires ADMIN role)
   */
  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/brands/${id}`);
    return res.data;
  },
};
