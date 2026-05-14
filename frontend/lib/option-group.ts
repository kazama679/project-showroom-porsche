import { apiClient } from './api';
import { PageResponse } from './brand';

export interface OptionGroup {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  displayOrder: number;
}

export interface OptionGroupFormData {
  categoryId: number;
  name: string;
  displayOrder: number;
}

export const optionGroupService = {
  async findAll(keyword: string = '', page: number = 0, size: number = 10): Promise<PageResponse<OptionGroup>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<OptionGroup>>("/option-groups", params);
    return res.data;
  },

  async findById(id: number): Promise<OptionGroup> {
    const res = await apiClient.get<OptionGroup>(`/option-groups/${id}`);
    return res.data;
  },

  async create(data: OptionGroupFormData): Promise<OptionGroup> {
    const res = await apiClient.post<OptionGroup>('/option-groups', data);
    return res.data;
  },

  async update(id: number, data: OptionGroupFormData): Promise<OptionGroup> {
    const res = await apiClient.put<OptionGroup>(`/option-groups/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/option-groups/${id}`);
  }
};
