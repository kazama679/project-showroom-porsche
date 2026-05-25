import { apiClient } from '@/lib/api';
import { PageResponse } from '@/services/brand';

export interface OptionRule {
  id: number;
  sourceOptionId: number;
  sourceOptionName: string;
  targetOptionId: number;
  targetOptionName: string;
  ruleType: string;
}

export interface OptionRuleFormData {
  sourceOptionId: number;
  targetOptionId: number;
  ruleType: string;
}

export const optionRuleService = {
  async findAll(keyword: string = '', page: number = 0, size: number = 10): Promise<PageResponse<OptionRule>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<OptionRule>>("/option-rules", params);
    return res.data;
  },

  async findById(id: number): Promise<OptionRule> {
    const res = await apiClient.get<OptionRule>(`/option-rules/${id}`);
    return res.data;
  },

  async create(data: OptionRuleFormData): Promise<OptionRule> {
    const res = await apiClient.post<OptionRule>('/option-rules', data);
    return res.data;
  },

  async update(id: number, data: OptionRuleFormData): Promise<OptionRule> {
    const res = await apiClient.put<OptionRule>(`/option-rules/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/option-rules/${id}`);
  }
};
