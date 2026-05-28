import { apiClient } from '@/lib/api'
import {
  ConfigSection,
  ConfiguratorModel,
  GalleryImage,
  ConfigOption,
  ConfigSubGroup,
} from '@/utils/configurator-data'
import { resolveOptionImageUrl } from '@/services/option-images'

export interface ConfiguratorApiResponse {
  id: number
  name: string
  year: number
  basePrice: number
  deliveryFee: number
  imageUrl: string | null
  sections: ConfiguratorApiSection[]
  galleryImages: ConfiguratorApiGalleryImage[]
  defaultSelections: Record<string, string>
}

export interface ConfiguratorApiSection {
  id: string
  title: string
  variant: 'color' | 'card' | 'list'
  subGroups: ConfiguratorApiSubGroup[]
}

export interface ConfiguratorApiSubGroup {
  id: string
  title: string
  selectionType?: 'SINGLE' | 'MULTIPLE'
  options: ConfiguratorApiOption[]
}

export interface ConfiguratorApiOption {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  isStandard: boolean
  imageUrl: string | null
  color: string | null
}

export interface ConfiguratorApiGalleryImage {
  id: string
  src: string
  alt: string
  type: string
}

function mapOption(option: ConfiguratorApiOption, groupTitle?: string): ConfigOption {
  const price = option.price ?? 0
  return {
    id: option.id,
    code: option.code,
    name: option.name,
    description: option.description ?? undefined,
    price: option.isStandard && price === 0 ? 0 : price,
    isStandard: option.isStandard,
    color: option.color ?? undefined,
    image: resolveOptionImageUrl(option.imageUrl, option.name, groupTitle),
  }
}

function mapSections(sections: ConfiguratorApiSection[]): ConfigSection[] {
  return sections.map((section) => ({
    id: section.id,
    title: section.title,
    variant: section.variant,
    subGroups: section.subGroups.map(
      (sg): ConfigSubGroup => ({
        id: sg.id,
        title: sg.title,
        selectionType: sg.selectionType ?? 'SINGLE',
        options: sg.options.map((o) => mapOption(o, sg.title)),
      })
    ),
  }))
}

function mapGallery(images: ConfiguratorApiGalleryImage[]): GalleryImage[] {
  return images.map((img) => ({
    id: img.id,
    src: img.src,
    alt: img.alt,
    type: (img.type === 'interior' || img.type === 'detail' ? img.type : 'exterior') as GalleryImage['type'],
  }))
}

export function mapConfiguratorResponse(data: ConfiguratorApiResponse): {
  model: ConfiguratorModel
  sections: ConfigSection[]
  galleryImages: GalleryImage[]
  defaultSelections: Record<string, string[]>
} {
  const model: ConfiguratorModel = {
    id: String(data.id),
    name: data.name,
    year: data.year,
    baseMsrp: Number(data.basePrice),
    deliveryFee: Number(data.deliveryFee),
    defaultImage: data.imageUrl ?? '',
  }

  const parsedSections = mapSections(data.sections)
  
  const defaultSelections = Object.entries(data.defaultSelections ?? {}).reduce<Record<string, string[]>>(
    (acc, [key, value]) => {
      if (value) acc[key] = [value]
      return acc
    },
    {}
  )

  // Enforce single selection rule for Exterior Colors on initial load
  const exteriorColorSection = parsedSections.find(
    (s) =>
      s.title.toLowerCase().includes('màu sắc ngoại thất') ||
      s.title.toLowerCase().includes('exterior color') ||
      s.title.toLowerCase().includes('exterior colors')
  )

  if (exteriorColorSection) {
    let colorFound = false
    for (const sg of exteriorColorSection.subGroups) {
      if (defaultSelections[sg.id]) {
        if (!colorFound) {
          colorFound = true
        } else {
          delete defaultSelections[sg.id]
        }
      }
    }
  }

  return {
    model,
    sections: parsedSections,
    galleryImages: mapGallery(data.galleryImages),
    defaultSelections,
  }
}

export const configuratorService = {
  async getByCarModelId(carModelId: number): Promise<ConfiguratorApiResponse> {
    const res = await apiClient.get<ConfiguratorApiResponse>(
      `/car-models/${carModelId}/configurator`
    )
    return res.data
  },
}

export interface PorscheConfiguratorAssets {
  source: string
  modelCode: string
  galleryImages: GalleryImage[]
  threeD?: {
    streamingAvailable: boolean
    iodEnabled: boolean
    serviceApi?: string
    reservationUrl?: string
    environments: Array<{
      id: string
      day?: string
      night?: string
    }>
    defaultEnvironment: {
      id: string
      day?: string
      night?: string
    } | null
    optionIds: string[]
    engineConfig: {
      orderType: string
      modelName?: string
      modelYear?: number
      region: string
      locale: string
      defaultCamera: string
      defaultLighting: string
      defaultEnvironment: string
    }
    session: {
      reservationUrl?: string
      token?: string
      expiresAt?: number
      matchmakerUrl?: string
      signalingServer?: string
      websocketUrl?: string
      error?: string
    } | null
  }
}

export async function getPorscheConfiguratorAssets(
  modelCode: string,
  locale = 'en-US',
  include3d = false
): Promise<PorscheConfiguratorAssets | null> {
  try {
    const params = new URLSearchParams({ modelCode, locale })
    if (include3d) params.set('include3d', '1')
    const res = await fetch(`/api/porsche-configurator?${params.toString()}`)
    if (!res.ok) return null
    return (await res.json()) as PorscheConfiguratorAssets
  } catch {
    return null
  }
}
