'use client'

import { apiClient } from '@/lib/api'

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

function parseBuild(build: any): SavedVehicleConfig {
  let parsedSelections = {}
  if (build.selections && typeof build.selections === 'string') {
    try {
      parsedSelections = JSON.parse(build.selections)
    } catch {
      // Do nothing
    }
  } else if (build.selections && typeof build.selections === 'object') {
    parsedSelections = build.selections
  }
  return { ...build, selections: parsedSelections }
}

export const carBuildApi = {
  async getMyBuilds(): Promise<SavedVehicleConfig[]> {
    try {
      const res = await apiClient.get<any>('/car-builds/my-builds')
      const builds: SavedVehicleConfig[] = Array.isArray(res) ? res : (res.data || [])
      return builds.map(parseBuild)
    } catch {
      return []
    }
  },

  async saveBuild(request: SaveVehicleRequest): Promise<SavedVehicleConfig> {
    const res = await apiClient.post<any>('/car-builds', request)
    return parseBuild(res.data || res)
  },

  async deleteBuild(id: string): Promise<void> {
    await apiClient.delete(`/car-builds/${id}`)
  },

  /**
   * Create a Porsche Code for a build configuration (no auth required).
   * Sends configuration to backend, which generates a unique code.
   */
  async createPorscheCode(request: SaveVehicleRequest): Promise<SavedVehicleConfig> {
    const res = await apiClient.post<any>('/car-builds/code', request)
    return parseBuild(res.data || res)
  },

  /**
   * Get a saved build by its Porsche Code (public, no auth required).
   */
  async getBuildByCode(porscheCode: string): Promise<SavedVehicleConfig> {
    const res = await apiClient.get<any>(`/car-builds/code/${porscheCode}`)
    return parseBuild(res.data || res)
  },
}
