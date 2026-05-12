// CarImage (Media) service - handles all media/image API calls
import { apiClient } from "./api";
import { PageResponse } from "./brand";

export interface CarImage {
  id: number;
  imageUrl: string;
  imageType: string;
  sortOrder: number | null;
  isDefault: boolean | null;
  createdAt: string | null;
  carModelId: number | null;
  carModelName: string | null;
}

export interface CarImageFormData {
  image?: File | null;
  imageType: string;
  sortOrder: number;
  isDefault: boolean;
  carModelId: number | null;
}

export const carImageService = {
  async findAll(keyword: string = "", page: number = 0, size: number = 10): Promise<PageResponse<CarImage>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    const res = await apiClient.get<PageResponse<CarImage>>("/car-images", params);
    return res.data;
  },

  async findById(id: number): Promise<CarImage> {
    const res = await apiClient.get<CarImage>(`/car-images/${id}`);
    return res.data;
  },

  async create(data: CarImageFormData): Promise<string> {
    const formData = new FormData();
    if (data.image) formData.append('image', data.image);
    formData.append('imageType', data.imageType);
    formData.append('sortOrder', String(data.sortOrder));
    formData.append('isDefault', String(data.isDefault));
    if (data.carModelId) formData.append('carModelId', String(data.carModelId));
    
    const res = await apiClient.post<string>("/car-images", formData);
    return res.data;
  },

  async update(id: number, data: CarImageFormData): Promise<string> {
    const formData = new FormData();
    if (data.image) formData.append('image', data.image);
    formData.append('imageType', data.imageType);
    formData.append('sortOrder', String(data.sortOrder));
    formData.append('isDefault', String(data.isDefault));
    if (data.carModelId) formData.append('carModelId', String(data.carModelId));

    const res = await apiClient.post<string>(`/car-images/${id}`, formData);
    return res.data;
  },

  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/car-images/${id}`);
    return res.data;
  },
};
