import {sanityPublicConfig} from './sanity-content-config.js'

const CASE_SLUG = /^case-0[1-6]$/
const CASE_BRANDS = new Set(['bmw', 'audi', 'mercedes-benz'])
const IMAGE_WIDTHS = [640, 960, 1600, 2400]
const SANITY_IMAGE_PATH = /^\/images\/([^/]+)\/([^/]+)\/([^/]+)$/
const LOCAL_VIDEO_PATH = /^\/assets\/videos\/(?:[A-Za-z0-9][A-Za-z0-9._-]*\/)*[A-Za-z0-9][A-Za-z0-9._-]*\.mp4$/i
const REMOTE_VIDEO_PATH = /^\/(?:[A-Za-z0-9][A-Za-z0-9._-]*\/)*[A-Za-z0-9][A-Za-z0-9._-]*\.mp4$/i
const SANITY_VIDEO_PATH = /^\/files\/v54qppoy\/production\/[A-Za-z0-9][A-Za-z0-9._-]*\.mp4$/i
const UNSAFE_URL_CHARACTERS = /[,\\\u0000-\u001f\u007f]/
const UNSAFE_VIDEO_URL_CHARACTERS = /[%\\\u0000-\u001f\u007f-\u009f\p{Cf}]/u
const caseProjection = `{
  _id, caseNumber, "slug": slug.current, order, brand, featured,
  vehicle, title, subtitle, lede, story,
  cover{imagePath, alt, "crop": asset.crop, "hotspot": asset.hotspot,
    "asset": asset.asset->{url, metadata{dimensions}}},
  video{externalUrl, "fileUrl": file.asset->url,
    poster{imagePath, alt, "crop": asset.crop, "hotspot": asset.hotspot,
      "asset": asset.asset->{url, metadata{dimensions}}}},
  mediaSections[]{_key, layout, heading, body,
    image{imagePath, alt, "crop": asset.crop, "hotspot": asset.hotspot,
      "asset": asset.asset->{url, metadata{dimensions}}}},
  seo{title, description,
    socialImage{imagePath, alt, "crop": asset.crop, "hotspot": asset.hotspot,
      "asset": asset.asset->{url, metadata{dimensions}}}}
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
      !url.username && !url.password && !url.hash && !url.pathname.includes('%') && Boolean(pathSegments) &&
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

export function isSafeCaseVideoUrl(value) {
  if (typeof value !== 'string' || !value || value !== value.trim() || UNSAFE_VIDEO_URL_CHARACTERS.test(value)) return false
  if (LOCAL_VIDEO_PATH.test(value)) return true
  if (!value.startsWith('https://')) return false

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.hash || url.search ||
      !REMOTE_VIDEO_PATH.test(url.pathname)) return false
    return url.hostname !== 'cdn.sanity.io' || SANITY_VIDEO_PATH.test(url.pathname)
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

function normalizeCrop(value) {
  const crop = {
    left: value?.left,
    right: value?.right,
    top: value?.top,
    bottom: value?.bottom,
  }
  if (!Object.values(crop).every((part) => Number.isFinite(part) && part >= 0 && part < 1) ||
    crop.left + crop.right >= 1 || crop.top + crop.bottom >= 1) return null
  return crop
}

function normalizeHotspot(value) {
  return Number.isFinite(value?.x) && value.x >= 0 && value.x <= 1 &&
    Number.isFinite(value?.y) && value.y >= 0 && value.y <= 1
    ? {x: value.x, y: value.y}
    : null
}

function percent(value) {
  return `${Number((Math.min(1, Math.max(0, value)) * 100).toFixed(2))}%`
}

export function buildResponsiveSanitySrcset(src, width) {
  if (!isSanityImageUrl(src) || !Number.isFinite(width) || width <= 0) return ''
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

  const sourceDimensions = imageDimensions(image)
  if (!isSanityImageUrl(assetUrl) || !sourceDimensions) return null

  const crop = normalizeCrop(image?.crop)
  const hotspot = normalizeHotspot(image?.hotspot)
  const url = new URL(assetUrl)
  let dimensions = sourceDimensions
  if (crop) {
    const left = Math.round(sourceDimensions.width * crop.left)
    const top = Math.round(sourceDimensions.height * crop.top)
    const width = Math.round(sourceDimensions.width * (1 - crop.left - crop.right))
    const height = Math.round(sourceDimensions.height * (1 - crop.top - crop.bottom))
    url.searchParams.set('rect', `${left},${top},${width},${height}`)
    dimensions = {width, height}
  }

  let objectPosition = ''
  if (hotspot) {
    const x = crop ? (hotspot.x - crop.left) / (1 - crop.left - crop.right) : hotspot.x
    const y = crop ? (hotspot.y - crop.top) / (1 - crop.top - crop.bottom) : hotspot.y
    objectPosition = `${percent(x)} ${percent(y)}`
  }

  const src = String(url)

  return {
    src,
    alt,
    ...dimensions,
    srcset: buildResponsiveSanitySrcset(src, dimensions.width),
    ...(objectPosition ? {objectPosition} : {}),
  }
}

export function isSafeCaseImage(image) {
  const src = image?.src
  if (typeof src !== 'string' || !src || src !== src.trim()) return false
  if (isCanonicalLocalAssetPath(src, '/assets/images/')) return true
  return isSanityImageUrl(src) && Number.isFinite(image.width) && image.width > 0 &&
    Number.isFinite(image.height) && image.height > 0
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
  const fileUrl = video.fileUrl
  const externalUrl = video.externalUrl
  const poster = buildResponsiveSanityImage(video.poster)
  const safeFileUrl = isSafeCaseVideoUrl(fileUrl) ? fileUrl : ''
  const safeExternalUrl = typeof externalUrl === 'string' && externalUrl.startsWith('https://') &&
    isSafeCaseVideoUrl(externalUrl) ? externalUrl : ''
  if (!safeFileUrl && !safeExternalUrl && !poster) return null
  return {
    ...(safeFileUrl ? {fileUrl: safeFileUrl} : {}),
    ...(safeExternalUrl ? {externalUrl: safeExternalUrl} : {}),
    ...(poster ? {poster} : {}),
  }
}

export function normalizeCaseRecord(record) {
  if (!record || typeof record !== 'object') return null

  const slug = text(record.slug)
  const order = record.order
  const title = normalizeLocalized(record.title)
  const cover = buildResponsiveSanityImage(record.cover)
  if (!isCaseSlug(slug) || !Number.isInteger(order) || order < 1 || order > 6 ||
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
    throw new TypeError('Sanity case slug must be case-01 through case-06')
  }

  const query = `*[_type == "casePage" && !(_id in path("drafts.*"))] | order(order asc) ${caseProjection}`
  const url = new URL(`https://${sanityPublicConfig.projectId}.api.sanity.io/v${sanityPublicConfig.apiVersion}/data/query/${sanityPublicConfig.dataset}`)
  url.searchParams.set('query', query)
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
      .sort((left, right) => left.order - right.order)
  } finally {
    clearTimeout(timeout)
  }
}
