import {sanityPublicConfig} from './sanity-content-config.js'

const CASE_SLUG = /^case-(?:0[1-9]|[12][0-9]|3[0-6])$/
const CASE_BRANDS = new Set(['bmw', 'audi', 'mercedes-benz'])
const IMAGE_WIDTHS = [640, 960, 1600, 2400]
const SANITY_IMAGE_PATH = /^\/images\/([^/]+)\/([^/]+)\/([^/]+)$/
const UNSAFE_URL_CHARACTERS = /[,\\\u0000-\u001f\u007f]/
const caseProjection = `{
  _id, caseNumber, "slug": slug.current, order, brand, featured,
  vehicle, title, subtitle, lede, story,
  cover{imagePath, alt, "asset": asset.asset->{url, metadata{dimensions}}},
  video{externalUrl, "fileUrl": file.asset->url,
    poster{imagePath, alt, "asset": asset.asset->{url, metadata{dimensions}}}},
  mediaSections[]{_key, layout, heading, body,
    image{imagePath, alt, "asset": asset.asset->{url, metadata{dimensions}}}},
  seo
}`

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isCaseSlug(value) {
  return typeof value === 'string' && CASE_SLUG.test(value)
}

function decodeLocalPath(pathname) {
  let decodedPath = pathname
  for (let index = 0; index < 8; index += 1) {
    if (/%(?:2f|5c)/i.test(decodedPath)) return null
    const nextPath = decodeURIComponent(decodedPath)
    if (nextPath === decodedPath) return decodedPath
    decodedPath = nextPath
  }
  return null
}

function isCanonicalLocalAssetPath(value, directory) {
  if (!value.startsWith('/')) return false

  try {
    const url = new URL(value, 'https://lonma.invalid')
    const decodedPath = decodeLocalPath(url.pathname)
    if (!decodedPath) return false
    const segments = decodedPath.split('/')
    return !url.search && !url.hash && decodedPath.startsWith(directory) &&
      decodedPath.length > directory.length &&
      segments.slice(1).every((segment) => segment && segment !== '.' && segment !== '..')
  } catch {
    return false
  }
}

function isCanonicalLocalMediaPath(value) {
  return isCanonicalLocalAssetPath(value, '/assets/images/') ||
    isCanonicalLocalAssetPath(value, '/assets/videos/')
}

function isSanityImageUrl(value) {
  if (typeof value !== 'string' || UNSAFE_URL_CHARACTERS.test(value)) return false

  try {
    const url = new URL(value)
    const pathSegments = url.pathname.match(SANITY_IMAGE_PATH)?.slice(1)
    return url.protocol === 'https:' && url.hostname === 'cdn.sanity.io' &&
      !url.username && !url.password && !url.hash && Boolean(pathSegments) &&
      pathSegments.every((segment) => {
        const decodedSegment = decodeURIComponent(segment)
        return decodedSegment && decodedSegment !== '.' && decodedSegment !== '..' &&
          !UNSAFE_URL_CHARACTERS.test(decodedSegment) && !decodedSegment.includes('/')
      })
  } catch {
    return false
  }
}

export function isSafeMediaUrl(value) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) return false
  if (isCanonicalLocalMediaPath(value)) return true

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

function imageDimensions(image) {
  const dimensions = image?.asset?.metadata?.dimensions
  const width = dimensions?.width
  const height = dimensions?.height
  return Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0
    ? {width, height}
    : null
}

function sanitySrcset(src, width) {
  const url = new URL(src)
  return IMAGE_WIDTHS.filter((candidate) => candidate <= width)
    .map((candidate) => {
      const transformed = new URL(url)
      transformed.searchParams.set('w', String(candidate))
      transformed.searchParams.set('auto', 'format')
      return `${transformed} ${candidate}w`
    })
    .join(', ')
}

export function buildResponsiveSanityImage(image) {
  const imagePath = text(image?.imagePath)
  const assetUrl = text(image?.asset?.url)
  const alt = normalizeLocalized(image?.alt)
  if (isCanonicalLocalAssetPath(imagePath, '/assets/images/')) {
    return {src: imagePath, alt}
  }

  const dimensions = imageDimensions(image)
  if (!isSanityImageUrl(assetUrl) || !dimensions) return null

  return {
    src: assetUrl,
    alt,
    ...dimensions,
    srcset: sanitySrcset(assetUrl, dimensions.width),
  }
}

export function normalizeLocalized(value, fallback = '') {
  const fallbackEnglish = typeof fallback === 'object' && fallback !== null
    ? text(fallback.en)
    : text(fallback)
  const english = text(value?.en) || fallbackEnglish
  const chinese = text(value?.zh) || english
  return {en: english, zh: chinese}
}

function normalizeMediaSection(section) {
  const image = buildResponsiveSanityImage(section?.image)
  if (!image) return null

  const layout = ['full', 'textLeft', 'textRight'].includes(section.layout) ? section.layout : 'full'
  return {
    key: text(section._key),
    layout,
    heading: normalizeLocalized(section.heading),
    body: normalizeLocalized(section.body),
    image,
  }
}

function normalizeVideo(video) {
  if (!video || typeof video !== 'object') return null
  const src = text(video.fileUrl) || text(video.externalUrl)
  const poster = buildResponsiveSanityImage(video.poster)
  if (!isSafeMediaUrl(src) && !poster) return null
  return {
    ...(isSafeMediaUrl(src) ? {src} : {}),
    ...(poster ? {poster} : {}),
  }
}

export function normalizeCaseRecord(record) {
  if (!record || typeof record !== 'object') return null

  const slug = text(record.slug)
  const order = record.order
  const title = normalizeLocalized(record.title)
  const cover = buildResponsiveSanityImage(record.cover)
  if (!isCaseSlug(slug) || !Number.isInteger(order) || order < 1 || order > 36 ||
    !CASE_BRANDS.has(record.brand) || !title.en || !cover) return null

  return {
    id: text(record._id),
    caseNumber: text(record.caseNumber),
    slug,
    order,
    brand: record.brand,
    featured: record.featured === true,
    vehicle: record.vehicle && typeof record.vehicle === 'object' ? {
      make: text(record.vehicle.make),
      model: text(record.vehicle.model),
      year: text(record.vehicle.year),
      chassis: text(record.vehicle.chassis),
      specification: text(record.vehicle.specification),
    } : null,
    title,
    subtitle: normalizeLocalized(record.subtitle),
    lede: normalizeLocalized(record.lede),
    story: normalizeLocalized(record.story),
    cover,
    video: normalizeVideo(record.video),
    mediaSections: Array.isArray(record.mediaSections)
      ? record.mediaSections.map(normalizeMediaSection).filter(Boolean)
      : [],
    seo: record.seo && typeof record.seo === 'object' ? {
      title: normalizeLocalized(record.seo.title),
      description: normalizeLocalized(record.seo.description),
      socialImage: buildResponsiveSanityImage(record.seo.socialImage),
    } : null,
  }
}

function ensureUniqueCases(cases) {
  const slugs = new Set()
  const orders = new Set()
  for (const caseRecord of cases) {
    if (slugs.has(caseRecord.slug)) throw new Error(`Sanity response contains duplicate case slug: ${caseRecord.slug}`)
    if (orders.has(caseRecord.order)) throw new Error(`Sanity response contains duplicate case order: ${caseRecord.order}`)
    slugs.add(caseRecord.slug)
    orders.add(caseRecord.order)
  }
  return cases
}

export function buildCaseQueryUrl(slug) {
  if (slug !== undefined && !isCaseSlug(slug)) {
    throw new TypeError('Sanity case slug must be case-01 through case-36')
  }

  const query = slug
    ? `*[_type == "casePage" && !(_id in path("drafts.*")) && slug.current == $slug][0]${caseProjection}`
    : `*[_type == "casePage" && !(_id in path("drafts.*"))] | order(order asc) ${caseProjection}`
  const url = new URL(`https://${sanityPublicConfig.projectId}.api.sanity.io/v${sanityPublicConfig.apiVersion}/data/query/${sanityPublicConfig.dataset}`)
  url.searchParams.set('query', query)
  if (slug) url.searchParams.set('$slug', JSON.stringify(slug))
  return url
}

export async function fetchPublishedCases({slug, fetchImpl = fetch, timeoutMs = 4000} = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(buildCaseQueryUrl(slug), {
      headers: {Accept: 'application/json'},
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Sanity request failed with ${response.status}`)
    const payload = await response.json()
    const records = Array.isArray(payload.result) ? payload.result : [payload.result]
    return ensureUniqueCases(records.map(normalizeCaseRecord).filter(Boolean))
  } finally {
    clearTimeout(timeout)
  }
}
