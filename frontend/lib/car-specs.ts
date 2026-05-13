import { apiClient } from "./api";

export interface CarPerformanceSpecDTO {
  id?: number;
  carModelId?: number;
  horsepower: number | null;
  acceleration0100: number | null;
  topSpeed: number | null;
}

export interface CarEngineSpecDTO {
  id?: number;
  carModelId?: number;
  engineType: string | null;
  drivetrain: string | null;
  fuelConsumption: number | null;
}

export interface CarElectricSpecDTO {
  id?: number;
  carModelId?: number;
  rangeKm: number | null;
  batteryCapacity: number | null;
  chargingTime: number | null;
}

export interface CarSpecsDTO {
  performance: CarPerformanceSpecDTO | null;
  engine: CarEngineSpecDTO | null;
  electric: CarElectricSpecDTO | null;
}

export const carSpecService = {
  async getSpecsByCarModelId(modelId: number): Promise<CarSpecsDTO> {
    const res = await apiClient.get<CarSpecsDTO>(`/car-models/${modelId}/specs`);
    return res.data;
  },

  async saveSpecs(modelId: number, data: CarSpecsDTO): Promise<CarSpecsDTO> {
    const res = await apiClient.put<CarSpecsDTO>(`/car-models/${modelId}/specs`, data);
    return res.data;
  },
};
