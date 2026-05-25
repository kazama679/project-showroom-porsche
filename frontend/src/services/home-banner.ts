// HomeBanner service - handles all home banner API calls
import { apiClient } from "@/lib/api";
import { PageResponse } from "@/services/brand";

export interface HomeBannerItem {
  id: number;
  carModelId: number | null;
  carModelName: string | null;
  title: string;
  type: string; // 'HERO' or 'CARD'
  videoUrl: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface HomeBannerFormData {
  carModelId: number | null;
  title: string;
  type: string;
  videoUrl: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

export const homeBannerService = {
  async findAll(
    keyword: string = "",
    page: number = 0,
    size: number = 10,
    type?: string
  ): Promise<PageResponse<HomeBannerItem>> {
    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      size: size.toString(),
    };
    if (type) {
      params.type = type;
    }
    const res = await apiClient.get<PageResponse<HomeBannerItem>>("/home-banners", params);
    return res.data;
  },

  async findActiveByType(type: string): Promise<HomeBannerItem[]> {
    const res = await apiClient.get<HomeBannerItem[]>("/home-banners/active", { type });
    return res.data;
  },

  async findById(id: number): Promise<HomeBannerItem> {
    const res = await apiClient.get<HomeBannerItem>(`/home-banners/${id}`);
    return res.data;
  },

  async create(data: HomeBannerFormData): Promise<any> {
    const res = await apiClient.post<any>("/home-banners", data);
    return res.data;
  },

  async update(id: number, data: HomeBannerFormData): Promise<any> {
    const res = await apiClient.put<any>(`/home-banners/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/home-banners/${id}`);
    return res.data;
  },
};
