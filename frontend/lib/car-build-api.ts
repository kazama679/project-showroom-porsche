'use client'

import { apiClient } from './api'

export interface SavedVehicleConfig {
  id: string
  modelId: number
  modelName: string
  modelYear: number
  porscheCode: string
  createdAt: string
  imageUrl: string
  galleryImages: string[]
  totalPrice: number
  baseMsrp: number
  equipmentPrice: number
  deliveryFee: number
  selections: Record<string, string[]> // Needs parse since it's JSON from backend
  colorName?: string
  interiorName?: string
  engineInfo?: string
  driveType?: string
  transmission?: string
}

export interface SaveVehicleRequest {
  modelId: number
  modelName: string
  modelYear: number
  imageUrl: string
  galleryImages: string[]
  totalPrice: number
  baseMsrp: number
  equipmentPrice: number
  deliveryFee: number
  selections: string // JSON representation
  colorName?: string
  interiorName?: string
  engineInfo?: string
  driveType?: string
  transmission?: string
}

export const carBuildApi = {
  async getMyBuilds(): Promise<SavedVehicleConfig[]> {
    try {
      const res = await apiClient.get<any>('/car-builds/my-builds')
      const builds: SavedVehicleConfig[] = Array.isArray(res) ? res : (res.data || [])
      
      // Make sure selections are parsed
      return builds.map(build => {
        let parsedSelections = {}
        if (build.selections && typeof build.selections === 'string') {
          try {
            parsedSelections = JSON.parse(build.selections)
          } catch {
            // Do nothing
          }
        }
        return { ...build, selections: parsedSelections }
      })
    } catch {
      return []
    }
  },

  async saveBuild(request: SaveVehicleRequest): Promise<SavedVehicleConfig> {
    const res = await apiClient.post<any>('/car-builds', request)
    return (res.data || res) as unknown as SavedVehicleConfig
  },

  async deleteBuild(id: string): Promise<void> {
    await apiClient.delete(`/car-builds/${id}`)
  }
}
