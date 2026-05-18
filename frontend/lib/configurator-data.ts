export type ConfigOption = {
  id: string
  code: string
  name: string
  price: number | null
  isStandard?: boolean
  color?: string
  image?: string
  description?: string
}

export type ConfigSubGroup = {
  id: string
  title: string
  fromPrice?: number
  options: ConfigOption[]
}

export type ConfigSection = {
  id: string
  title: string
  subGroups: ConfigSubGroup[]
}

export type SelectedEquipmentGroup = {
  id: string
  title: string
  count: number
  items: ConfigOption[]
}

export type GalleryImage = {
  id: string
  src: string
  alt: string
  type: 'exterior' | 'interior' | 'detail'
}

export type InventoryItem = {
  id: string
  name: string
  image: string
  condition: string
  mileage: string
  year: string
  location: string
  price: number
}

export type ConfiguratorModel = {
  id: string
  name: string
  year: number
  baseMsrp: number
  deliveryFee: number
  defaultImage: string
}

const IMG = {
  exterior:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
  exteriorSide:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-HvPGlp3DPixDvG3erPCAGZBzmGc4OR.png',
  exteriorRear:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
  interior:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
  interiorDash:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-HvPGlp3DPixDvG3erPCAGZBzmGc4OR.png',
  wheel:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
  package:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-HvPGlp3DPixDvG3erPCAGZBzmGc4OR.png',
  heritage:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
}

export const CONFIGURATOR_MODEL: ConfiguratorModel = {
  id: '992442',
  name: '911 Carrera 4 GTS',
  year: 2026,
  baseMsrp: 189300,
  deliveryFee: 2350,
  defaultImage: IMG.exterior,
}

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', src: IMG.exterior, alt: '911 Carrera 4 GTS front three-quarter', type: 'exterior' },
  { id: '2', src: IMG.exteriorSide, alt: '911 Carrera 4 GTS side profile', type: 'exterior' },
  { id: '3', src: IMG.exteriorRear, alt: '911 Carrera 4 GTS rear view', type: 'exterior' },
  { id: '4', src: IMG.interior, alt: 'Interior sport seats', type: 'interior' },
  { id: '5', src: IMG.interiorDash, alt: 'Dashboard and steering wheel', type: 'interior' },
  { id: '6', src: IMG.exterior, alt: 'Exterior detail', type: 'detail' },
  { id: '7', src: IMG.exteriorSide, alt: 'Exterior side detail', type: 'detail' },
  { id: '8', src: IMG.interior, alt: 'Interior rear seats', type: 'interior' },
  { id: '9', src: IMG.wheel, alt: 'Wheel detail', type: 'detail' },
  { id: '10', src: IMG.exteriorRear, alt: 'Rear taillight detail', type: 'detail' },
]

export const DEFAULT_SELECTIONS: Record<string, string> = {
  'exterior-colors': '0Q',
  wheels: '58Y',
  'interior-material': 'AX',
  seats: 'Q4Q',
  'rear-seats': '3UG',
  packages: 'none',
}

export const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: 'exterior-colors',
    title: 'Exterior Colors',
    subGroups: [
      {
        id: 'contrasts',
        title: 'Contrasts',
        options: [
          { id: '0Q', code: '0Q', name: 'White', price: 0, color: '#FFFFFF' },
          { id: 'A1', code: 'A1', name: 'Black', price: 0, color: '#1A1A1A' },
        ],
      },
      {
        id: 'shades',
        title: 'Shades',
        options: [
          { id: '2T', code: '2T', name: 'Jet Black Metallic', price: 880, color: '#2B2B2B' },
          { id: '1H', code: '1H', name: 'Vanadium Grey Metallic', price: 880, color: '#6B7280' },
          { id: 'U2', code: 'U2', name: 'GT Silver Metallic', price: 880, color: '#9CA3AF' },
          { id: 'G7', code: 'G7', name: 'Ice Grey Metallic', price: 880, color: '#D1D5DB' },
        ],
      },
      {
        id: 'dreams',
        title: 'Dreams',
        options: [
          { id: 'G1', code: 'G1', name: 'Guards Red', price: 1580, color: '#CC0000' },
          { id: '1A', code: '1A', name: 'Gentian Blue Metallic', price: 1580, color: '#1E3A8A' },
          { id: '0L', code: '0L', name: 'Carmine Red', price: 1580, color: '#991B1B' },
          { id: 'D9', code: 'D9', name: 'Cartagena Yellow Metallic', price: 1580, color: '#EAB308' },
          { id: '6M', code: '6M', name: 'Provence', price: 1580, color: '#7C3AED' },
          { id: 'O1', code: 'O1', name: 'Lugano Blue', price: 1580, color: '#2563EB' },
        ],
      },
      {
        id: 'legends',
        title: 'Legends',
        options: [
          { id: 'N4', code: 'N4', name: 'Oak Green Metallic Neo', price: 3160, color: '#14532D' },
          { id: 'U4', code: 'U4', name: 'Aventurine Green Metallic', price: 3160, color: '#166534' },
          { id: 'G9', code: 'G9', name: 'Shade Green Metallic', price: 3160, color: '#065F46' },
          { id: '2M', code: '2M', name: 'Slate Grey Neo', price: 3160, color: '#374151' },
        ],
      },
    ],
  },
  {
    id: 'wheels',
    title: 'Wheels',
    subGroups: [
      {
        id: '20-21-wheels',
        title: '20"/21" Wheels',
        options: [
          {
            id: '58Y',
            code: '58Y',
            name: '20"/21" Carrera GTS Wheels',
            price: null,
            isStandard: true,
            image: IMG.wheel,
          },
          {
            id: '5XX',
            code: '5XX',
            name: '20"/21" Turbo S Design Wheels',
            price: 2390,
            image: IMG.wheel,
          },
          {
            id: 'UX7',
            code: 'UX7',
            name: '20"/21" RS Spyder Design Wheels',
            price: 3190,
            image: IMG.wheel,
          },
        ],
      },
    ],
  },
  {
    id: 'interior-material',
    title: 'Interior Colors & Material',
    subGroups: [
      {
        id: 'leather-interior',
        title: 'Leather Interior',
        options: [
          { id: 'AX', code: 'AX', name: 'Leather Interior in Black', price: 0, color: '#1A1A1A' },
          { id: 'EM2', code: 'EM2', name: 'Leather Interior in Slate Grey', price: 0, color: '#4B5563' },
          { id: '95B', code: '95B', name: 'Leather Interior in Bordeaux Red', price: 0, color: '#7F1D1D' },
        ],
      },
      {
        id: 'club-leather',
        title: 'Club Leather Interior',
        options: [
          { id: '1BV', code: '1BV', name: 'Club Leather Interior in Black', price: 1620, color: '#111827' },
          { id: 'GH3', code: 'GH3', name: 'Club Leather Interior in Graphite Blue', price: 1620, color: '#1E3A5F' },
        ],
      },
    ],
  },
  {
    id: 'seats',
    title: 'Seats',
    subGroups: [
      {
        id: 'sport-seats',
        title: 'Sport Seats',
        options: [
          {
            id: 'QJ6',
            code: 'QJ6',
            name: 'Power Sport Seats (14-way) with Memory Package',
            price: 1620,
          },
        ],
      },
      {
        id: 'sport-seats-plus',
        title: 'Sport Seats Plus',
        options: [
          {
            id: 'Q4Q',
            code: 'Q4Q',
            name: 'Sport Seats Plus (4-way)',
            price: null,
            isStandard: true,
            image: IMG.interior,
          },
          {
            id: 'KQ3',
            code: 'KQ3',
            name: 'Adaptive Sport Seats Plus (18-way) with Memory Package',
            price: 3210,
            image: IMG.interior,
          },
        ],
      },
      {
        id: 'lightweight-bucket',
        title: 'Lightweight Bucket Seats',
        options: [
          {
            id: '8IT',
            code: '8IT',
            name: 'Folding Lightweight Bucket Seats',
            price: 6940,
            image: IMG.interior,
          },
        ],
      },
      {
        id: 'more-seat-options',
        title: 'More seat options',
        options: [
          { id: '3UG', code: '3UG', name: 'Rear Seats', price: 0 },
          { id: '9VK', code: '9VK', name: 'Ventilated Seats (Front)', price: 900 },
        ],
      },
    ],
  },
  {
    id: 'packages',
    title: 'Packages',
    subGroups: [
      {
        id: 'packages-list',
        title: 'Packages',
        options: [
          { id: 'none', code: '', name: 'No Package', price: 0 },
          {
            id: 'premium',
            code: 'PREM',
            name: 'Premium Package',
            price: 4920,
            image: IMG.package,
            description: 'Includes advanced driver assistance and comfort features.',
          },
          {
            id: 'premium-park',
            code: 'PREMP',
            name: 'Premium Package with Remote ParkAssist',
            price: 5370,
            image: IMG.package,
          },
          {
            id: 'heritage',
            code: 'HERIT',
            name: 'Heritage Design Interior Package - Pasha',
            price: 9380,
            image: IMG.heritage,
          },
          {
            id: 'exclusive',
            code: 'EXCL',
            name: 'Exclusive Manufaktur Leather Interior',
            price: 13000,
            image: IMG.interior,
          },
          {
            id: 'extended-exclusive',
            code: 'EXCLE',
            name: 'Extended Exclusive Manufaktur Leather Interior',
            price: 3100,
            image: IMG.interior,
          },
        ],
      },
    ],
  },
]

export const SUMMARY_EQUIPMENT: SelectedEquipmentGroup[] = [
  {
    id: 'exterior-colors-wheels',
    title: 'Exterior Colors & Wheels',
    count: 2,
    items: [
      { id: '0Q', code: '0Q', name: 'White', price: 0, color: '#FFFFFF' },
      {
        id: '58Y',
        code: '58Y',
        name: '20"/21" Carrera GTS Wheels',
        price: null,
        isStandard: true,
      },
    ],
  },
  {
    id: 'interior-colors-seats',
    title: 'Interior Colors & Seats',
    count: 3,
    items: [
      { id: 'AX', code: 'AX', name: 'Leather Interior in Black', price: 0, color: '#1A1A1A' },
      {
        id: 'Q4Q',
        code: 'Q4Q',
        name: 'Sport Seats Plus (4-way)',
        price: null,
        isStandard: true,
      },
      { id: '3UG', code: '3UG', name: 'Rear Seats', price: 0 },
    ],
  },
  {
    id: 'exterior',
    title: 'Exterior',
    count: 4,
    items: [
      {
        id: '3S4',
        code: '3S4',
        name: 'Preparation for Roof Transport System',
        price: null,
        isStandard: true,
      },
      { id: '8IT-ext', code: '8IT', name: 'Matrix Design LED Headlights', price: null, isStandard: true },
      {
        id: '8VG',
        code: '8VG',
        name: 'Taillight strip with "PORSCHE" logo',
        price: null,
        isStandard: true,
      },
      { id: '4GP', code: '4GP', name: 'Windshield with Grey Top Tint', price: null, isStandard: true },
    ],
  },
  {
    id: 'interior',
    title: 'Interior',
    count: 1,
    items: [
      {
        id: '2ZF',
        code: '2ZF',
        name: 'GT Sport Steering Wheel in Race-Tex with Mode Switch',
        price: null,
        isStandard: true,
      },
    ],
  },
  {
    id: 'technology',
    title: 'Technology',
    count: 4,
    items: [
      {
        id: 'G1G',
        code: 'G1G',
        name: '8-speed Porsche Doppelkupplung (PDK)',
        price: null,
        isStandard: true,
      },
      { id: '4F6', code: '4F6', name: 'Comfort Access', price: null, isStandard: true },
      { id: 'VC2', code: 'VC2', name: 'HomeLink®', price: null, isStandard: true },
      { id: '9VK-tech', code: '9VK', name: 'Sound Package Plus', price: null, isStandard: true },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    count: 1,
    items: [
      {
        id: 'Z1S',
        code: 'Z1S',
        name: 'Included First Year / 10,000 Mile Maintenance',
        price: 0,
        description: 'Basic equipment',
      },
    ],
  },
]

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: '1',
    name: '2026 Porsche 911 Carrera 4 GTS',
    image: IMG.exterior,
    condition: 'New Car',
    mileage: '0 mi',
    year: '2026',
    location: 'Porsche Mechanicsburg',
    price: 191650,
  },
  {
    id: '2',
    name: '2026 Porsche 911 Carrera 4 GTS - White',
    image: IMG.exteriorSide,
    condition: 'New Car',
    mileage: '12 mi',
    year: '2026',
    location: 'Porsche St. Louis',
    price: 193200,
  },
  {
    id: '3',
    name: '2026 Porsche 911 Carrera 4',
    image: IMG.exteriorRear,
    condition: 'New Car',
    mileage: '0 mi',
    year: '2026',
    location: 'Porsche Beverly Hills',
    price: 135670,
  },
  {
    id: '4',
    name: '2026 Porsche 911 Carrera GTS',
    image: IMG.exterior,
    condition: 'Pre-Owned',
    mileage: '3,420 mi',
    year: '2026',
    location: 'Porsche Atlanta',
    price: 178900,
  },
]

export const MSRP_DISCLAIMER =
  'All information is subject to change without notice. Neither Porsche Cars North America, Inc. nor the manufacturer can accept liability arising from the use of any information contained herein. Only an actual invoice issued by PCNA at the time a vehicle is sold to an authorized Porsche dealer may be used as an official indication of equipment and pricing.'

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function getOptionPriceLabel(option: ConfigOption): string {
  if (option.isStandard) return 'Standard Equipment'
  if (option.price === null || option.price === 0) return option.price === 0 ? '$0' : 'Standard Equipment'
  return formatPrice(option.price)
}

export function getSubGroupPriceLabel(subGroup: ConfigSubGroup): string {
  const prices = subGroup.options
    .map((o) => o.price)
    .filter((p): p is number => p !== null && p > 0)
  if (prices.length === 0) return '$0'
  const min = Math.min(...prices)
  return min === 0 ? '$0' : formatPrice(min)
}

export function calculateTotal(
  baseMsrp: number,
  deliveryFee: number,
  selections: Record<string, string>
): { equipmentPrice: number; total: number } {
  let equipmentPrice = 0

  for (const section of CONFIG_SECTIONS) {
    const selectedId = selections[section.id]
    if (!selectedId) continue

    for (const subGroup of section.subGroups) {
      const option = subGroup.options.find((o) => o.id === selectedId)
      if (option?.price && option.price > 0) {
        equipmentPrice += option.price
      }
    }
  }

  return {
    equipmentPrice,
    total: baseMsrp + equipmentPrice + deliveryFee,
  }
}

export function findOptionById(optionId: string): ConfigOption | undefined {
  for (const section of CONFIG_SECTIONS) {
    for (const subGroup of section.subGroups) {
      const found = subGroup.options.find((o) => o.id === optionId)
      if (found) return found
    }
  }
  return undefined
}
