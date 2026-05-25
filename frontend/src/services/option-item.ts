import { apiClient } from '@/lib/api';
import { PageResponse } from '@/services/brand';

export interface OptionItem {
  id: number;
  optionGroupId: number;
  optionGroupName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface OptionItemFormData {
  optionGroupId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const optionItemService = {
  async findAll(keyword: string = '', page: number = 0, size: number = 10): Promise<PageResponse<OptionItem>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<OptionItem>>("/option-items", params);
    return res.data;
  },

  async findById(id: number): Promise<OptionItem> {
    const res = await apiClient.get<OptionItem>(`/option-items/${id}`);
    return res.data;
  },

  async create(data: OptionItemFormData): Promise<OptionItem> {
    const res = await apiClient.post<OptionItem>('/option-items', data);
    return res.data;
  },

  async update(id: number, data: OptionItemFormData): Promise<OptionItem> {
    const res = await apiClient.put<OptionItem>(`/option-items/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/option-items/${id}`);
  }
};
