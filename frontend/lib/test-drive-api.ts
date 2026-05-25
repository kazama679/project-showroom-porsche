'use client'

import { apiClient } from './api'

export interface TestDriveBookingRequest {
  carModelId?: number
  carName?: string
  porscheCode?: string
  dealerName?: string
  dealerAddress?: string
  salutation: string
  firstName: string
  lastName: string
  email: string
  countryCode?: string
  phoneNumber?: string
  preferredDate?: string
  preferredTime?: string
  message?: string
}

export interface TestDriveBookingResponse {
  id: number
  userId?: number
  carModelId?: number
  carName: string
  porscheCode?: string
  dealerName: string
  dealerAddress: string
  salutation: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  countryCode: string
  phoneNumber: string
  preferredDate: string
  preferredTime: string
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export const testDriveApi = {
  // Common users (anonymous or authenticated)
  createBooking: async (data: TestDriveBookingRequest): Promise<TestDriveBookingResponse> => {
    const res = await apiClient.post<TestDriveBookingResponse>('/test-drive-bookings', data)
    return res.data || res as any
  },

  // Authenticated users
  getMyBookings: async (): Promise<TestDriveBookingResponse[]> => {
    const res = await apiClient.get<TestDriveBookingResponse[]>('/test-drive-bookings/my-bookings')
    return Array.isArray(res) ? res : (res.data || [])
  },

  // Admin users
  getAllBookingsForAdmin: async (): Promise<TestDriveBookingResponse[]> => {
    const res = await apiClient.get<TestDriveBookingResponse[]>('/admin/test-drive-bookings')
    return Array.isArray(res) ? res : (res.data || [])
  },

  getBookingDetailForAdmin: async (id: number): Promise<TestDriveBookingResponse> => {
    const res = await apiClient.get<TestDriveBookingResponse>(`/admin/test-drive-bookings/${id}`)
    return res.data || res as any
  },

  approveBooking: async (id: number, adminNote?: string): Promise<TestDriveBookingResponse> => {
    const res = await apiClient.put<TestDriveBookingResponse>(`/admin/test-drive-bookings/${id}/approve`, { adminNote })
    return res.data || res as any
  },

  rejectBooking: async (id: number, adminNote?: string): Promise<TestDriveBookingResponse> => {
    const res = await apiClient.put<TestDriveBookingResponse>(`/admin/test-drive-bookings/${id}/reject`, { adminNote })
    return res.data || res as any
  },

  deleteBooking: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/test-drive-bookings/${id}`)
  }
}
