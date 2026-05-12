// CarModel service - handles all car model API calls
import { apiClient } from "./api";
import { PageResponse } from "./brand";

export interface CarModelItem {
  id: number;
  name: string;
  year: number;
  basePrice: number;
  shortDescription: string | null;
  fuelType: string | null;
  transmission: string | null;
  seats: number | null;
  isActive: boolean | null;
  seriesId: number | null;
  seriesName: string | null;
  bodyTypeId: number | null;
  bodyTypeName: string | null;
  imageUrl?: string | null;
}

export interface CarModelFormData {
  name: string;
  year: number;
  basePrice: number;
  shortDescription: string;
  fuelType: string;
  transmission: string;
  seats: number;
  isActive: boolean;
  seriesId: number | null;
  bodyTypeId: number | null;
}

export const carModelService = {
  async findAll(keyword: string = "", page: number = 0, size: number = 10, seriesId?: number): Promise<PageResponse<CarModelItem>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    if (seriesId !== undefined && seriesId !== null) {
      params.seriesId = seriesId.toString();
    }
    const res = await apiClient.get<PageResponse<CarModelItem>>("/car-models", params);
    return res.data;
  },

  async findById(id: number): Promise<CarModelItem> {
    const res = await apiClient.get<CarModelItem>(`/car-models/${id}`);
    return res.data;
  },

  async create(data: CarModelFormData): Promise<string> {
    const res = await apiClient.post<string>("/car-models", data);
    return res.data;
  },

  async update(id: number, data: CarModelFormData): Promise<string> {
    const res = await apiClient.put<string>(`/car-models/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/car-models/${id}`);
    return res.data;
  },
};
