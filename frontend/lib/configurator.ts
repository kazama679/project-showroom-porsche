import { apiClient } from './api'
import {
  ConfigSection,
  ConfiguratorModel,
  GalleryImage,
  ConfigOption,
  ConfigSubGroup,
} from './configurator-data'
import { resolveOptionImageUrl } from './option-images'

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
  defaultSelections: Record<string, string>
} {
  const model: ConfiguratorModel = {
    id: String(data.id),
    name: data.name,
    year: data.year,
    baseMsrp: Number(data.basePrice),
    deliveryFee: Number(data.deliveryFee),
    defaultImage: data.imageUrl ?? '',
  }

  return {
    model,
    sections: mapSections(data.sections),
    galleryImages: mapGallery(data.galleryImages),
    defaultSelections: data.defaultSelections,
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
