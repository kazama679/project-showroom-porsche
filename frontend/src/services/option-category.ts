// OptionCategory service - handles all option category API calls
import { apiClient } from "@/lib/api";
import { PageResponse } from "@/services/brand";

export interface OptionCategory {
  id: number;
  name: string;
  displayOrder: number | null;
}

export interface OptionCategoryFormData {
  name: string;
  displayOrder: number;
}

export const optionCategoryService = {
  async findAll(keyword: string = "", page: number = 0, size: number = 10): Promise<PageResponse<OptionCategory>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<OptionCategory>>("/option-categories", params);
    return res.data;
  },

  async findById(id: number): Promise<OptionCategory> {
    const res = await apiClient.get<OptionCategory>(`/option-categories/${id}`);
    return res.data;
  },

  async create(data: OptionCategoryFormData): Promise<string> {
    const res = await apiClient.post<string>("/option-categories", data);
    return res.data;
  },

  async update(id: number, data: OptionCategoryFormData): Promise<string> {
    const res = await apiClient.put<string>(`/option-categories/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/option-categories/${id}`);
    return res.data;
  },
};
