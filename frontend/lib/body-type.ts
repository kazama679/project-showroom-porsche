import { apiClient } from "./api";

export interface BodyType {
  id: number;
  name: string;
  description: string | null;
}

export interface BodyTypeFormData {
  name: string;
  description: string | null;
}

export const bodyTypeService = {
  async findAll(): Promise<BodyType[]> {
    const res = await apiClient.get<BodyType[]>("/body-types");
    return res.data;
  },

  async findById(id: number): Promise<BodyType> {
    const res = await apiClient.get<BodyType>(`/body-types/${id}`);
    return res.data;
  },

  async create(data: BodyTypeFormData): Promise<BodyType> {
    const res = await apiClient.post<BodyType>("/body-types", data);
    return res.data;
  },

  async update(id: number, data: BodyTypeFormData): Promise<BodyType> {
    const res = await apiClient.put<BodyType>(`/body-types/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<string> {
    const res = await apiClient.delete<string>(`/body-types/${id}`);
    return res.data;
  },
};
