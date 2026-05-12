import { apiClient } from "./api";

export interface BodyType {
  id: number;
  name: string;
  description: string | null;
}

export const bodyTypeService = {
  async findAll(): Promise<BodyType[]> {
    const res = await apiClient.get<BodyType[]>("/body-types");
    return res.data;
  },
};
