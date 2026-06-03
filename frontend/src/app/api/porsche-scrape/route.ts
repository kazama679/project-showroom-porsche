import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function GET(request: NextRequest) {
  const modelCode = request.nextUrl.searchParams.get('modelCode') || '9921B2'
  const filename = `porsche-${modelCode}-scrape.json`
  const filePath = path.join(process.cwd(), 'data', filename)

  try {
    const content = await readFile(filePath, 'utf8')
    return new NextResponse(content, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { error: `Scraped Porsche data not found for ${modelCode}.` },
      { status: 404 }
    )
  }
}
