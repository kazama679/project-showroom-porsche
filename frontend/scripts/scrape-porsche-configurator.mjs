import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CONFIGURATOR_ORIGIN = 'https://configurator.porsche.com'
const PRS_ORIGIN = 'https://prs.porsche.com'
const MODEL_CODE = process.argv[2] || '9921B2'
const LOCALE = process.argv[3] || 'en-US'
const COUNTRY = 'US'
const OUT_DIR = path.resolve('data')
const OUT_FILE = path.join(OUT_DIR, `porsche-${MODEL_CODE}-scrape.json`)

const LZ_KEY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$'

function compressToEncodedURIComponent(input) {
  if (input == null) return ''
  return compress(input, 6, (a) => LZ_KEY.charAt(a))
}

function compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (uncompressed == null) return ''

  let i
  let value
  const contextDictionary = {}
  const contextDictionaryToCreate = {}
  let contextC = ''
  let contextW = ''
  let contextWc = ''
  let contextEnlargeIn = 2
  let contextDictSize = 3
  let contextNumBits = 2
  const contextData = []
  let contextDataVal = 0
  let contextDataPosition = 0

  const writeBit = (bit) => {
    contextDataVal = (contextDataVal << 1) | bit
    if (contextDataPosition === bitsPerChar - 1) {
      contextDataPosition = 0
      contextData.push(getCharFromInt(contextDataVal))
      contextDataVal = 0
    } else {
      contextDataPosition += 1
    }
  }

  const writeBits = (numBits, val) => {
    for (let j = 0; j < numBits; j += 1) {
      writeBit(val & 1)
      val >>= 1
    }
  }

  for (let ii = 0; ii < uncompressed.length; ii += 1) {
    contextC = uncompressed.charAt(ii)
    if (!Object.prototype.hasOwnProperty.call(contextDictionary, contextC)) {
      contextDictionary[contextC] = contextDictSize++
      contextDictionaryToCreate[contextC] = true
    }

    contextWc = contextW + contextC
    if (Object.prototype.hasOwnProperty.call(contextDictionary, contextWc)) {
      contextW = contextWc
    } else {
      if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
        if (contextW.charCodeAt(0) < 256) {
          writeBits(contextNumBits, 0)
          writeBits(8, contextW.charCodeAt(0))
        } else {
          writeBits(contextNumBits, 1)
          writeBits(16, contextW.charCodeAt(0))
        }
        contextEnlargeIn -= 1
        if (contextEnlargeIn === 0) {
          contextEnlargeIn = 2 ** contextNumBits
          contextNumBits += 1
        }
        delete contextDictionaryToCreate[contextW]
      } else {
        writeBits(contextNumBits, contextDictionary[contextW])
      }
      contextEnlargeIn -= 1
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = 2 ** contextNumBits
        contextNumBits += 1
      }
      contextDictionary[contextWc] = contextDictSize++
      contextW = String(contextC)
    }
  }

  if (contextW !== '') {
    if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
      if (contextW.charCodeAt(0) < 256) {
        writeBits(contextNumBits, 0)
        writeBits(8, contextW.charCodeAt(0))
      } else {
        writeBits(contextNumBits, 1)
        writeBits(16, contextW.charCodeAt(0))
      }
      contextEnlargeIn -= 1
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = 2 ** contextNumBits
        contextNumBits += 1
      }
      delete contextDictionaryToCreate[contextW]
    } else {
      writeBits(contextNumBits, contextDictionary[contextW])
    }
    contextEnlargeIn -= 1
    if (contextEnlargeIn === 0) {
      contextNumBits += 1
    }
  }

  value = 2
  writeBits(contextNumBits, value)

  while (true) {
    contextDataVal <<= 1
    if (contextDataPosition === bitsPerChar - 1) {
      contextData.push(getCharFromInt(contextDataVal))
      break
    }
    contextDataPosition += 1
  }

  return contextData.join('')
}

function sortLikePorsche(value) {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    return value
      .map((item) => sortLikePorsche(item))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  }

  return Object.keys(value)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .reduce((acc, key) => {
      acc[key] = sortLikePorsche(value[key])
      return acc
    }, {})
}

function buildIodConfig({ modelCode, modelYear, options, camera, environment = 'Oasis', lighting = 'DAY' }) {
  return {
    config: {
      animations: [],
      camera: {
        id: camera,
        options: { variant: 'desktop' },
      },
      environment: {
        id: environment,
        options: {},
      },
      lighting: {
        id: lighting,
        options: {},
      },
      product: {
        id: modelCode,
        options: {
          config: options,
          country: COUNTRY,
          modelYear,
        },
      },
    },
    settings: {
      format: 'jpeg',
      transparent: false,
    },
  }
}

function buildIodImageUrl({ modelCode, modelYear, options, camera = 'ext-low-front-left', environment, lighting }) {
  const compressed = compressToEncodedURIComponent(
    JSON.stringify(sortLikePorsche(buildIodConfig({ modelCode, modelYear, options, camera, environment, lighting })))
  )
  return `${PRS_ORIGIN}/iod/image/${COUNTRY}/${modelCode}/1/${compressed}?clientId=icc`
}

function absolutizeAssetUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${CONFIGURATOR_ORIGIN}${url}`
}

function decodePorscheDataTable(payload) {
  const table = JSON.parse(payload)
  const memo = new Map()

  function decodeRef(ref) {
    if (ref === -7) return null
    if (ref === -1) return undefined
    if (typeof ref !== 'number') return ref
    return decodeSlot(ref)
  }

  function decodeSlot(index) {
    if (memo.has(index)) return memo.get(index)
    const value = table[index]
    if (!value || typeof value !== 'object') return value

    if (Array.isArray(value)) {
      const decoded = []
      memo.set(index, decoded)
      value.forEach((item) => decoded.push(decodeRef(item)))
      return decoded
    }

    const decoded = {}
    memo.set(index, decoded)
    Object.entries(value).forEach(([keyRef, valueRef]) => {
      const key = keyRef.startsWith('_') ? String(decodeSlot(Number(keyRef.slice(1)))) : keyRef
      decoded[key] = decodeRef(valueRef)
    })
    return decoded
  }

  return decodeSlot(0)
}

function cleanHtml(value) {
  if (!value) return null
  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function buildConfigAfterClick({ option, groupItems, categoryItems, baseOptions }) {
  const base = new Set(baseOptions)
  const selectedInGroup = groupItems.filter((item) => item.isSelected).map((item) => item.id)
  const selectedInCategory = categoryItems.filter((item) => item.isSelected).map((item) => item.id)
  const sameFamily = categoryItems
    .filter((item) => item.family && item.family === option.family)
    .map((item) => item.id)

  for (const id of unique([...selectedInGroup, ...selectedInCategory, ...sameFamily])) {
    base.delete(id)
  }
  base.add(option.id)
  return [...base]
}

function flattenOptions(optionsList, baseOptions, prsOptions, modelMeta, prsMeta) {
  const flat = []
  const sections = []

  for (const [sectionIndex, section] of (optionsList ?? []).entries()) {
    const sectionOut = {
      id: section.id,
      title: section.title,
      index: sectionIndex,
      categories: [],
    }

    for (const [categoryIndex, category] of (section.categories ?? []).entries()) {
      const categoryItems = (category.groups ?? []).flatMap((group) => group.items ?? [])
      const categoryOut = {
        id: category.id,
        title: category.title,
        index: categoryIndex,
        selectedOptions: category.selectedOptions ?? [],
        groups: [],
      }

      for (const [groupIndex, group] of (category.groups ?? []).entries()) {
        const groupItems = group.items ?? []
        const groupOut = {
          id: group.id,
          title: group.title,
          type: group.groupType,
          index: groupIndex,
          selectedOptions: group.selectedOptions ?? [],
          items: [],
        }

        for (const option of groupItems) {
          const staticOptionsAfterClick = buildConfigAfterClick({
            option,
            groupItems,
            categoryItems,
            baseOptions,
          })
          const prsOptionsAfterClick = buildConfigAfterClick({
            option,
            groupItems,
            categoryItems,
            baseOptions: prsOptions,
          })
          const optionOut = {
            id: option.id,
            title: option.title,
            sectionId: section.id,
            sectionTitle: section.title,
            categoryId: category.id,
            categoryTitle: category.title,
            groupId: group.id,
            groupTitle: group.title,
            optionType: option.optionType,
            family: option.family,
            isSelected: Boolean(option.isSelected),
            isStandardEquipment: Boolean(option.isStandardEquipment),
            isBasicOption: Boolean(option.isBasicOption),
            price: option.price,
            priceNumeric: option.priceNumeric,
            color: option.color ?? null,
            thumbnail: absolutizeAssetUrl(option.thumbnail),
            materialImage: absolutizeAssetUrl(option.materialImage),
            description: cleanHtml(option.description),
            packageContents: option.packageContents ?? null,
            staticImageApisAfterClick: {
              frontLeft: buildIodImageUrl({
                ...modelMeta,
                ...prsMeta,
                options: staticOptionsAfterClick,
                camera: 'ext-low-front-left',
              }),
              sideLeft: buildIodImageUrl({
                ...modelMeta,
                ...prsMeta,
                options: staticOptionsAfterClick,
                camera: 'ext-low-side-left',
              }),
              interiorDashboard: buildIodImageUrl({
                ...modelMeta,
                ...prsMeta,
                options: staticOptionsAfterClick,
                camera: 'int-front-dashboard',
              }),
            },
            threeDUpdateAfterClick: {
              transport: 'WebRTC data channel UIInteraction',
              messageType: 'req_product',
              payload: {
                id: modelMeta.modelCode,
                options: {
                  config: prsOptionsAfterClick,
                  country: COUNTRY,
                  modelYear: modelMeta.modelYear,
                },
              },
            },
          }

          flat.push(optionOut)
          groupOut.items.push(optionOut)
        }

        categoryOut.groups.push(groupOut)
      }

      sectionOut.categories.push(categoryOut)
    }

    sections.push(sectionOut)
  }

  return { sections, flatOptions: flat }
}

async function main() {
  const dataUrl = `${CONFIGURATOR_ORIGIN}/${LOCALE}/mode/model/${MODEL_CODE}.data`
  const response = await fetch(dataUrl, {
    headers: {
      accept: 'text/x-script,application/json,text/plain,*/*',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    },
  })

  if (!response.ok) {
    throw new Error(`Porsche configurator returned ${response.status}`)
  }

  const payload = await response.text()
  const root = decodePorscheDataTable(payload)
  const data = root?.['customer-configurator']?.data
  if (!data) throw new Error('Unable to decode customer-configurator data')

  const catalog = data.catalog ?? {}
  const prs = data.prs ?? {}
  const modelMeta = {
    modelCode: catalog.orderType ?? MODEL_CODE,
    modelYear: catalog.modelYear,
  }
  const prsMeta = {
    environment: prs.defaultEnvironment?.id ?? 'Oasis',
    lighting: 'DAY',
  }
  const baseOptions = data.configuration?.options ?? []
  const prsOptions = prs.optionIds ?? []
  const { sections, flatOptions } = flattenOptions(
    data.views?.optionsList,
    baseOptions,
    prsOptions,
    modelMeta,
    prsMeta
  )

  const colorOptions = flatOptions.filter((option) => option.color?.length)
  const exteriorColors = flatOptions.filter((option) => option.sectionId === 'section-exterior-color')
  const selectedExterior = exteriorColors.find((option) => option.isSelected)

  const result = {
    scrapedAt: new Date().toISOString(),
    source: {
      pageUrl: `${CONFIGURATOR_ORIGIN}/${LOCALE}/mode/model/${MODEL_CODE}`,
      dataUrl,
      note: 'The visible Porsche page is hydrated from this .data payload. 3D rendering is Pixel Streaming, not downloadable glb/gltf.',
    },
    model: {
      orderType: catalog.orderType,
      modelName: catalog.modelName,
      modelFamily: catalog.modelFamily,
      modelYear: catalog.modelYear,
      engineType: catalog.engineType,
      market: data.market,
      basePrice: data.configuration?.prices?.main?.base ?? null,
      destinationCharge: data.configuration?.prices?.main?.destinationCharge ?? null,
    },
    defaultConfiguration: {
      allStaticImageOptions: baseOptions,
      prs3dOptions: prsOptions,
      selectedExteriorColor: selectedExterior
        ? {
            id: selectedExterior.id,
            title: selectedExterior.title,
            color: selectedExterior.color,
          }
        : null,
    },
    images: {
      mainStage: (data.mainStage?.stage ?? []).map((image) => ({
        ...image,
        url: absolutizeAssetUrl(image.url),
      })),
      fullscreen: (data.mainStage?.fullscreen ?? []).map((image) => ({
        ...image,
        url: absolutizeAssetUrl(image.url),
      })),
      fullscreenSlides: (data.mainStage?.fullscreenSlides ?? []).map((image) => ({
        ...image,
        src: absolutizeAssetUrl(image.src),
      })),
      thumbnails: (data.mainStage?.thumbnails ?? []).map((image) => ({
        ...image,
        url: absolutizeAssetUrl(image.url),
      })),
      visualizations: Object.fromEntries(
        Object.entries(data.visualizations ?? {}).map(([key, image]) => [
          key,
          {
            ...image,
            url: absolutizeAssetUrl(image.url),
          },
        ])
      ),
    },
    threeD: {
      streamingAvailable: Boolean(prs.isStreamingAvailable),
      iodEnabled: Boolean(prs.isIODEnabled),
      reservationUrl: prs.reservationUrl,
      serviceApi: prs.baseUrl?.serviceApi,
      signalingServerApiTemplate: prs.baseUrl?.serviceApi
        ? `${prs.baseUrl.serviceApi}/matchmaker/signalingserver?key={reservationToken}`
        : null,
      websocketTemplate: 'wss://{signalingServerFromMatchmaker}?token={reservationToken}',
      environments: prs.environments ?? [],
      defaultEnvironment: prs.defaultEnvironment ?? null,
      updateOptionMechanism: {
        note: 'Changing color/options in 3D reuses the same Pixel Streaming session and sends a UIInteraction message over WebRTC data channel. It is not one separate 3D model API per option.',
        messageType: 'req_product',
        payloadShape: {
          id: MODEL_CODE,
          options: {
            config: '{new prs option id array}',
            country: COUNTRY,
            modelYear: catalog.modelYear,
          },
        },
      },
    },
    sections,
    indexes: {
      optionCount: flatOptions.length,
      colorOptionCount: colorOptions.length,
      exteriorColorCount: exteriorColors.length,
      selectedOptionIds: flatOptions.filter((option) => option.isSelected).map((option) => option.id),
      exteriorColors: exteriorColors.map((option) => ({
        id: option.id,
        title: option.title,
        price: option.price,
        color: option.color,
        thumbnail: option.thumbnail,
        staticImageApisAfterClick: option.staticImageApisAfterClick,
        threeDUpdateAfterClick: option.threeDUpdateAfterClick,
      })),
    },
    flatOptions,
  }

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_FILE, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

  console.log(`Saved ${flatOptions.length} options to ${OUT_FILE}`)
  console.log(`Exterior colors: ${exteriorColors.length}`)
  console.log(`Selected exterior: ${selectedExterior?.id ?? 'unknown'} ${selectedExterior?.title ?? ''}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
