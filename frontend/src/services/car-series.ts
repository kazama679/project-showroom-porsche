// CarSeries service - handles all car series API calls
import { apiClient } from "@/lib/api";
import { PageResponse } from "@/services/brand";

export interface CarSeries {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean | null;
  brandId: number | null;
  brandName: string | null;
  imageUrl?: string;
  videoUrl?: string;
  // Optional fields used by some pages/components
  price?: number | null;
  models?: Array<{ id: number }> | null;
}

export interface CarSeriesFormData {
  name: string;
  description: string;
  isActive: boolean;
  brandId: number | null;
  image?: File | null;
  video?: File | null;
}

export const carSeriesService = {
  async findAll(keyword: string = "", page: number = 0, size: number = 10): Promise<PageResponse<CarSeries>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<CarSeries>>("/car-series", params);
    return res.data;
  },

  async findById(id: number): Promise<CarSeries> {
    const res = await apiClient.get<CarSeries>(`/car-series/${id}`);
    return res.data;
  },

  async create(data: CarSeriesFormData): Promise<string> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('isActive', String(data.isActive));
    if (data.brandId) formData.append('brandId', String(data.brandId));
    if (data.image) formData.append('image', data.image);
    if (data.video) formData.append('video', data.video);

    const res = await apiClient.post<string>("/car-series", formData);
    return res.data;
  },

  async update(id: number, data: CarSeriesFormData): Promise<string> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('isActive', String(data.isActive));
    if (data.brandId) formData.append('brandId', String(data.brandId));
    if (data.image) formData.append('image', data.image);
    if (data.video) formData.append('video', data.video);

    const res = await apiClient.post<string>(`/car-series/${id}`, formData);
    return res.data;
  },

  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/car-series/${id}`);
    return res.data;
  },
};
