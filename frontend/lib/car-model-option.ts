import { apiClient } from './api';
import { PageResponse } from './brand';

export interface CarModelOption {
  id: number;
  carModelId: number;
  carModelName: string;
  optionItemId: number;
  optionItemName: string;
}

export interface CarModelOptionFormData {
  carModelId: number;
  optionItemId: number;
}

export const carModelOptionService = {
  async findAll(
    keyword: string = '',
    page: number = 0,
    size: number = 10,
    carModelId?: number
  ): Promise<PageResponse<CarModelOption>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    if (carModelId != null) {
      params.carModelId = carModelId.toString();
    }
    const res = await apiClient.get<PageResponse<CarModelOption>>("/car-model-options", params);
    return res.data;
  },

  async findByCarModelId(
    carModelId: number,
    keyword: string = '',
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<CarModelOption>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<CarModelOption>>(
      `/car-model-options/car-model/${carModelId}`,
      params
    );
    return res.data;
  },

  async findById(id: number): Promise<CarModelOption> {
    const res = await apiClient.get<CarModelOption>(`/car-model-options/${id}`);
    return res.data;
  },

  async create(data: CarModelOptionFormData): Promise<CarModelOption> {
    const res = await apiClient.post<CarModelOption>('/car-model-options', data);
    return res.data;
  },

  async update(id: number, data: CarModelOptionFormData): Promise<CarModelOption> {
    const res = await apiClient.put<CarModelOption>(`/car-model-options/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/car-model-options/${id}`);
  }
};
