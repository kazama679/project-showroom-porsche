import { NextRequest, NextResponse } from 'next/server'

type PorscheGalleryImage = {
  id: string
  src: string
  alt: string
  type: 'exterior' | 'interior' | 'detail'
}

type PorschePrsData = {
  reservationUrl?: string
  baseUrl?: {
    iodApi?: string
    serviceApi?: string
    healthServiceApi?: string
  }
  environments?: Array<{
    id: string
    day?: string
    night?: string
  }>
  defaultEnvironment?: {
    id: string
    day?: string
    night?: string
  }
  isStreamingAvailable?: boolean
  isIODEnabled?: boolean
  optionIds?: string[]
}

const PORSCHE_CONFIGURATOR_ORIGIN = 'https://configurator.porsche.com'
const IOD_IMAGE_RE = /https:\/\/prs\.porsche\.com\/iod\/image\/([A-Z]{2})\/([A-Z0-9]+)\/1\/[^"'<>\\\s]+/g

function cleanPorscheUrl(url: string): string {
  return url
    .replace(/\\u0026/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/[\\,]+$/g, '')
}

function classifyImage(index: number): PorscheGalleryImage['type'] {
  if (index >= 8 && index < 12) return 'interior'
  if (index >= 12) return 'detail'
  return 'exterior'
}


function extractIodImages(payload: string, modelCode: string): PorscheGalleryImage[] {
  const uniqueUrls = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = IOD_IMAGE_RE.exec(payload)) !== null) {
    const url = cleanPorscheUrl(match[0])
    if (url.includes(`/${modelCode}/`)) {
      uniqueUrls.add(url)
    }
  }

  return Array.from(uniqueUrls)
    .slice(0, 24)
    .map((src, index) => ({
      id: `porsche-${modelCode}-${index + 1}`,
      src,
      alt: `Porsche ${modelCode} configurator view ${index + 1}`,
      type: classifyImage(index),
    }))
}

function decodePorscheDataTable(payload: string): Record<string, unknown> | null {
  try {
    const table = JSON.parse(payload) as unknown[]
    const memo = new Map<number, unknown>()

    function decodeRef(ref: unknown): unknown {
      if (ref === -7) return null
      if (ref === -1) return undefined
      if (typeof ref !== 'number') return ref
      return decodeSlot(ref)
    }

    function decodeSlot(index: number): unknown {
      if (memo.has(index)) return memo.get(index)

      const value = table[index]
      if (!value || typeof value !== 'object') return value

      if (Array.isArray(value)) {
        const decoded: unknown[] = []
        memo.set(index, decoded)
        value.forEach((item) => decoded.push(decodeRef(item)))
        return decoded
      }

      const decoded: Record<string, unknown> = {}
      memo.set(index, decoded)
      Object.entries(value as Record<string, unknown>).forEach(([keyRef, valueRef]) => {
        const key = keyRef.startsWith('_')
          ? String(decodeSlot(Number(keyRef.slice(1))))
          : keyRef
        decoded[key] = decodeRef(valueRef)
      })
      return decoded
    }

    return decodeSlot(0) as Record<string, unknown>
  } catch {
    return null
  }
}

function getCustomerConfiguratorData(root: Record<string, unknown> | null): Record<string, unknown> {
  const customerConfigurator = root?.['customer-configurator'] as
    | { data?: Record<string, unknown> }
    | undefined
  return customerConfigurator?.data ?? {}
}

async function createPorsche3DSession(
  prs: PorschePrsData | undefined,
  refererUrl: string
) {
  if (!prs?.isStreamingAvailable || !prs.reservationUrl) return null

  const reservation = await fetch(prs.reservationUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json,text/plain,*/*',
      origin: PORSCHE_CONFIGURATOR_ORIGIN,
      referer: refererUrl,
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    },
  })

  if (!reservation.ok) {
    return {
      error: `PRS reservation returned ${reservation.status}`,
      reservationUrl: prs.reservationUrl,
    }
  }

  const reservationData = (await reservation.json()) as {
    token?: string
    expire?: number
  }

  if (!reservationData.token || !prs.baseUrl?.serviceApi) {
    return {
      error: 'PRS reservation did not return a token',
      reservationUrl: prs.reservationUrl,
    }
  }

  const matchmakerUrl = `${prs.baseUrl.serviceApi}/matchmaker/signalingserver?key=${encodeURIComponent(
    reservationData.token
  )}`
  const matchmaker = await fetch(matchmakerUrl, {
    headers: {
      accept: 'application/json,text/plain,*/*',
      origin: PORSCHE_CONFIGURATOR_ORIGIN,
      referer: refererUrl,
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    },
  })

  if (!matchmaker.ok) {
    return {
      error: `PRS matchmaker returned ${matchmaker.status}`,
      reservationUrl: prs.reservationUrl,
      token: reservationData.token,
      expiresAt: reservationData.expire,
    }
  }

  const matchmakerData = (await matchmaker.json()) as {
    signalingServer?: string
  }

  return {
    reservationUrl: prs.reservationUrl,
    token: reservationData.token,
    expiresAt: reservationData.expire,
    matchmakerUrl,
    signalingServer: matchmakerData.signalingServer,
    websocketUrl: matchmakerData.signalingServer
      ? `wss://${matchmakerData.signalingServer}`
      : undefined,
  }
}

export async function GET(request: NextRequest) {
  const modelCode = request.nextUrl.searchParams.get('modelCode')?.trim() || '9921B2'
  const locale = request.nextUrl.searchParams.get('locale')?.trim() || 'en-US'
  const include3d = request.nextUrl.searchParams.get('include3d') === '1'

  if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale) || !/^[A-Z0-9]{4,12}$/.test(modelCode)) {
    return NextResponse.json({ error: 'Invalid Porsche configurator request' }, { status: 400 })
  }

  const dataUrl = `${PORSCHE_CONFIGURATOR_ORIGIN}/${locale}/mode/model/${modelCode}.data`

  try {
    const response = await fetch(dataUrl, {
      headers: {
        accept: 'text/x-script,application/json,text/plain,*/*',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
      },
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Porsche configurator returned ${response.status}` },
        { status: 502 }
      )
    }

    const payload = await response.text()
    const galleryImages = extractIodImages(payload, modelCode)
    const decoded = decodePorscheDataTable(payload)
    const data = getCustomerConfiguratorData(decoded)
    const prs = data.prs as PorschePrsData | undefined
    const catalog = data.catalog as
      | { orderType?: string; modelYear?: number; modelName?: string }
      | undefined
    const market = data.market as { region?: string; locale?: string } | undefined
    const refererUrl = `${PORSCHE_CONFIGURATOR_ORIGIN}/${locale}/mode/model/${modelCode}?viz-mode=3d`
    const threeDSession = include3d ? await createPorsche3DSession(prs, refererUrl) : null

    return NextResponse.json({
      source: dataUrl,
      modelCode,
      galleryImages,
      threeD: {
        streamingAvailable: Boolean(prs?.isStreamingAvailable),
        iodEnabled: Boolean(prs?.isIODEnabled),
        serviceApi: prs?.baseUrl?.serviceApi,
        reservationUrl: prs?.reservationUrl,
        environments: prs?.environments ?? [],
        defaultEnvironment: prs?.defaultEnvironment ?? null,
        optionIds: prs?.optionIds ?? [],
        engineConfig: {
          orderType: catalog?.orderType ?? modelCode,
          modelName: catalog?.modelName,
          modelYear: catalog?.modelYear,
          region: market?.region ?? 'US',
          locale: market?.locale ?? locale,
          defaultCamera: 'ext-low-front-left',
          defaultLighting: 'DAY',
          defaultEnvironment: prs?.defaultEnvironment?.id ?? 'Oasis',
        },
        session: threeDSession,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Unable to load Porsche configurator data' }, { status: 502 })
  }
}
