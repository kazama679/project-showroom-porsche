export interface InquiryPayload {
  salutation: string
  firstName: string
  lastName: string
  email: string
  countryCode?: string
  phoneNumber?: string
  message?: string
  dealerName?: string
  dealerAddress?: string
  porscheCode?: string
  carName?: string
  carPrice?: number
  basePrice?: number
}

export async function submitInquiry(payload: InquiryPayload, carOptionId?: number, carImageUrl?: string) {
  const params = new URLSearchParams()
  if (carOptionId) params.append('carOptionId', carOptionId.toString())
  if (carImageUrl) params.append('carImageUrl', carImageUrl)

  const url = `http://localhost:8080/api/v1/inquiries${params.toString() ? '?' + params.toString() : ''}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Failed to submit inquiry')
  }

  return res.json()
}
