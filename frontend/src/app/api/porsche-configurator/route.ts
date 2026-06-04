import { NextRequest, NextResponse } from 'next/server'

type PorscheGalleryImage = {
  id: string
  src: string
  alt: string
  type: 'exterior' | 'interior' | 'detail'
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

export async function GET(request: NextRequest) {
  const modelCode = request.nextUrl.searchParams.get('modelCode')?.trim() || '9921B2'
  const locale = request.nextUrl.searchParams.get('locale')?.trim() || 'en-US'

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

    return NextResponse.json({
      source: dataUrl,
      modelCode,
      galleryImages,
    })
  } catch {
    return NextResponse.json({ error: 'Unable to load Porsche configurator data' }, { status: 502 })
  }
}
