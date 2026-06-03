/** Fallback thumbnails when option_items.image_url is empty */
export const OPTION_FALLBACK_IMAGES = {
  wheel:
    'https://res.cloudinary.com/dfireq2op/image/upload/v1778661086/porsche/9abe3dfc-d98a-42d1-806e-49da8a25ca8d.avif',
  interior:
    'https://res.cloudinary.com/dfireq2op/image/upload/v1778661011/porsche/305482cb-a5b2-48cc-8c64-2826fdc29d3b.avif',
  default:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
} as const

const BLOCKED_OPTION_IMAGE_URLS = new Set([
  'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif',
])

export function resolveOptionImageUrl(
  imageUrl: string | null | undefined,
  optionName: string,
  groupTitle?: string
): string | undefined {
  const trimmedImageUrl = imageUrl?.trim()
  if (trimmedImageUrl && !BLOCKED_OPTION_IMAGE_URLS.has(trimmedImageUrl)) return trimmedImageUrl

  const combined = `${optionName} ${groupTitle ?? ''}`.toLowerCase()
  if (combined.includes('mâm') || combined.includes('wheel') || combined.includes('bánh')) {
    return OPTION_FALLBACK_IMAGES.wheel
  }
  if (combined.includes('sơn') || combined.includes('màu') || combined.includes('paint')) {
    return undefined
  }
  if (combined.includes('ghế') || combined.includes('seat') || combined.includes('nội thất')) {
    return OPTION_FALLBACK_IMAGES.interior
  }
  return OPTION_FALLBACK_IMAGES.default
}
