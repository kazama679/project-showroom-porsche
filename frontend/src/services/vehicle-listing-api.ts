'use client'

import { apiClient } from '@/lib/api'

export interface VehicleListingData {
  // 1. Vehicle Information
  vin?: string
  make?: string
  model?: string
  trimLevel?: string
  modelYear?: number
  mileage?: number
  exteriorColor?: string
  interiorColor?: string
  fuelType?: string
  transmission?: string
  drivetrain?: string
  seats?: number
  registrationArea?: string

  // 2. Pricing & Transaction
  askingPrice?: number
  isNegotiable?: boolean
  paymentMethods?: string
  hasLien?: boolean
  zipCode?: string
  city?: string
  stateProvince?: string
  supportsShipping?: boolean
  acceptsTradeIn?: boolean

  // 3. Vehicle Condition
  hasAccident?: boolean
  accidentDescription?: string
  hasFloodDamage?: boolean
  hasRepaint?: boolean
  repaintDescription?: string
  engineCondition?: string
  transmissionCondition?: string
  tireCondition?: string
  brakeCondition?: string
  hasWarningLights?: boolean
  hasElectricalIssues?: boolean
  hasModifications?: boolean
  modificationsDescription?: string
  hasSmokingPetExposure?: boolean
  conditionDescription?: string

  // 4. Maintenance History & Documents
  hasServiceRecords?: boolean
  dealerServiced?: boolean
  lastServiceMileage?: number
  hasRepairInvoices?: boolean
  titleStatus?: string
  hasOpenRecalls?: boolean
  registrationValidUntil?: string
  ownerNumber?: number
  hasCarfaxReport?: boolean

  // 5. Seller Contact
  sellerFullName: string
  sellerPhone?: string
  sellerEmail: string
  sellerCity?: string
  sellerState?: string
  sellerType?: string
  preferredContactTime?: string
  preferredContactMethod?: string
}

export interface ImageUpload {
  file: File
  type: string
  preview: string
}

export interface VehicleListingResponse extends Partial<VehicleListingData> {
  id: number
  status: string
  createdAt: string
  images: { id: number; imageUrl: string; imageType: string }[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export const vehicleListingApi = {
  async createListing(data: VehicleListingData, images: ImageUpload[]): Promise<VehicleListingResponse> {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))

    const imageTypes: string[] = []
    images.forEach((img) => {
      formData.append('images', img.file)
      imageTypes.push(img.type)
    })

    const url = `${API_BASE}/vehicle-listings${imageTypes.length > 0 ? '?' + imageTypes.map(t => `imageTypes=${t}`).join('&') : ''}`

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(errorData || 'Failed to create listing')
    }

    const result = await res.json()
    return result.data ?? result
  },

  async getListingById(id: number): Promise<VehicleListingResponse> {
    const res = await apiClient.get<VehicleListingResponse>(`/vehicle-listings/${id}`)
    return res.data
  },

  async getApprovedListings(): Promise<VehicleListingResponse[]> {
    const res = await apiClient.get<VehicleListingResponse[]>(`/vehicle-listings`)
    return res.data
  },

  // ADMIN METHODS
  async getAllListings(status?: string): Promise<VehicleListingResponse[]> {
    const url = status ? `/admin/vehicle-listings?status=${status}` : `/admin/vehicle-listings`
    const res = await apiClient.get<VehicleListingResponse[]>(url)
    return res.data
  },

  async updateListingStatus(id: number, status: string, note?: string): Promise<VehicleListingResponse> {
    const body = note ? { note } : {}
    const res = await apiClient.put<VehicleListingResponse>(`/admin/vehicle-listings/${id}/status?status=${status}`, body)
    return res.data
  },
}
