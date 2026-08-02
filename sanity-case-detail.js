import {buildResponsiveSanitySrcset, fetchPublishedCases, isSafeCaseImage, isSafeCaseVideoUrl} from './sanity-case-data.js?v=sanity-case-cms-20260801'

const warnedRoots = new WeakSet()
const notifiedRoots = new WeakSet()
const pendingRoots = new WeakMap()
const fallbackImages = new WeakSet()
const CASE_SLUG = /^case-0[1-6]$/
const OBJECT_POSITION = /^(?:100|\d{1,2})(?:\.\d{1,2})?% (?:100|\d{1,2})(?:\.\d{1,2})?%$/

function isLocalized(value) {
  return value && typeof value.en === 'string' && typeof value.zh === 'string'
}

function applyLocalizedNode(node, value) {
  if (!node || !isLocalized(value)) return false
  node.dataset.en = value.en
  node.dataset.zh = value.zh
  node.textContent = value.en
  return true
}

function applyLocalizedAlt(image, value) {
  if (!image || !isLocalized(value)) return
  image.dataset.enAlt = value.en
  image.dataset.zhAlt = value.zh
  image.setAttribute('alt', value.en)
}

function localImagePath(value, baseURI) {
  if (typeof value !== 'string' || !value) return ''
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(value)) return ''
  try {
    const url = new URL(value, baseURI || 'https://lonma.invalid/pages/cases/case.html')
    return url.pathname.startsWith('/assets/images/')
      ? decodeURIComponent(url.pathname)
      : ''
  } catch {
    return ''
  }
}

function attributeEntries(element) {
  return Array.from(element?.attributes || [], (attribute) => Array.isArray(attribute)
    ? [String(attribute[0]), String(attribute[1])]
    : [attribute.name, attribute.value])
}

function preserveStaticImageOnError(image) {
  if (fallbackImages.has(image) || typeof image?.addEventListener !== 'function' || !image.getAttribute('src')) return
  const attributes = attributeEntries(image)
  const objectPosition = image.style?.objectPosition || ''
  fallbackImages.add(image)
  image.addEventListener('error', () => {
    for (const [name] of attributeEntries(image)) image.removeAttribute(name)
    for (const [name, value] of attributes) image.setAttribute(name, value)
    if (image.style) image.style.objectPosition = objectPosition
  }, {once: true})
}

export function applyResponsiveImage(image, source, sizes = '100vw') {
  if (!image || !isSafeCaseImage(source)) return false

  const currentLocalPath = localImagePath(image.getAttribute('src'), image.baseURI)
  const sourceLocalPath = localImagePath(source.src, image.baseURI)
  if (currentLocalPath && currentLocalPath === sourceLocalPath) {
    applyLocalizedAlt(image, source.alt)
    return true
  }

  preserveStaticImageOnError(image)
  image.setAttribute('src', source.src)
  const hasDimensions = Number.isFinite(source.width) && source.width > 0 &&
    Number.isFinite(source.height) && source.height > 0
  const srcset = hasDimensions ? buildResponsiveSanitySrcset(source.src, source.width) : ''
  if (srcset) {
    image.setAttribute('srcset', srcset)
    image.setAttribute('sizes', sizes)
  } else {
    image.removeAttribute('srcset')
    image.removeAttribute('sizes')
  }
  if (hasDimensions) {
    image.setAttribute('width', String(source.width))
    image.setAttribute('height', String(source.height))
  } else {
    image.removeAttribute('width')
    image.removeAttribute('height')
  }
  applyLocalizedAlt(image, source.alt)
  if (source.src.startsWith('https://cdn.sanity.io/images/') &&
    OBJECT_POSITION.test(source.objectPosition) && image.style) {
    image.style.objectPosition = source.objectPosition
  }
  return true
}

function commitCaseVideoPoster(video, poster) {
  if (!video || !isSafeCaseImage(poster)) return false
  video.setAttribute('poster', poster.src)
  if (poster.src.startsWith('/assets/images/')) {
    video.removeAttribute('srcset')
    video.removeAttribute('sizes')
  }
  if (isLocalized(poster.alt)) {
    video.setAttribute('data-en-alt', poster.alt.en)
    video.setAttribute('data-zh-alt', poster.alt.zh)
  }
  if (video.style) {
    video.style.objectPosition = poster.src.startsWith('https://cdn.sanity.io/images/') &&
      OBJECT_POSITION.test(poster.objectPosition) ? poster.objectPosition : ''
  }
  return true
}

function applyCaseVideoPoster(video, poster, {ImageCtor = globalThis.Image} = {}) {
  if (!video || !isSafeCaseImage(poster)) return false
  if (typeof ImageCtor !== 'function') return false

  const preload = new ImageCtor()
  preload.addEventListener('load', () => commitCaseVideoPoster(video, poster), {once: true})
  preload.addEventListener('error', () => {}, {once: true})
  preload.src = poster.src
  return true
}

function caseVideoSource(video) {
  if (isSafeCaseVideoUrl(video?.fileUrl)) return video.fileUrl
  return typeof video?.externalUrl === 'string' && video.externalUrl.startsWith('https://') &&
    isSafeCaseVideoUrl(video.externalUrl) ? video.externalUrl : ''
}

export function applyCaseVideo(record, root, options) {
  const stage = root?.querySelector('.case02-video-stage')
  const video = root?.querySelector('[data-case-video]')
  if (!stage || !video) return false

  const source = caseVideoSource(record?.video)
  const posterChanged = applyCaseVideoPoster(video, record?.video?.poster, options)
  if (!source) {
    if (!posterChanged) return false
    stage.dataset.videoState = 'poster-only'
    video.removeAttribute('controls')
    video.setAttribute('aria-disabled', 'true')
    video.pause?.()
    return true
  }

  video.setAttribute('src', source)
  globalThis.window?.lonmaRefreshCaseVideoState?.()
  stage.dataset.videoState = 'ready'
  video.setAttribute('controls', '')
  video.removeAttribute('aria-disabled')
  video.load()
  return true
}

function hasMediaItem(item) {
  return item && ['full', 'textLeft', 'textRight'].includes(item.layout) &&
    isSafeCaseImage(item.image)
}

function createMediaImage(item, document, sizes, onImageError) {
  const image = document.createElement('img')
  image.loading = 'lazy'
  image.decoding = 'async'
  applyResponsiveImage(image, item.image, sizes)
  if (typeof onImageError === 'function' && typeof image.addEventListener === 'function') {
    image.addEventListener('error', onImageError, {once: true})
  }
  return image
}

function createCase02Copy(item, document, number) {
  const copy = document.createElement('div')
  copy.className = 'case02-story-copy'
  const index = document.createElement('p')
  index.textContent = String(number).padStart(2, '0')
  copy.append(index)
  if (isLocalized(item.heading) && (item.heading.en || item.heading.zh)) {
    const heading = document.createElement('h2')
    applyLocalizedNode(heading, item.heading)
    copy.append(heading)
  }
  if (isLocalized(item.body) && (item.body.en || item.body.zh)) {
    const body = document.createElement('p')
    applyLocalizedNode(body, item.body)
    copy.append(body)
  }
  return copy
}

function renderCase02MediaSections(items, document, onImageError) {
  const fragment = document.createDocumentFragment()
  let beat = 0

  for (const item of items) {
    if (!hasMediaItem(item)) continue
    const figure = document.createElement('figure')
    figure.className = item.layout === 'full'
      ? 'case02-story-media case02-story-wide'
      : 'case02-story-media'
    figure.append(createMediaImage(item, document, '(max-width: 768px) 100vw, 70vw', onImageError))

    const hasCopy = (isLocalized(item.heading) && (item.heading.en || item.heading.zh)) ||
      (isLocalized(item.body) && (item.body.en || item.body.zh))
    if (item.layout === 'full') {
      if (!hasCopy) {
        fragment.append(figure)
        continue
      }
      beat += 1
      const section = document.createElement('section')
      section.className = 'case02-story-full'
      section.append(createCase02Copy(item, document, beat), figure)
      fragment.append(section)
      continue
    }

    beat += 1
    const section = document.createElement('section')
    section.className = item.layout === 'textRight'
      ? 'case02-story-beat case02-story-beat-test'
      : 'case02-story-beat case02-story-beat-direction'
    const copy = createCase02Copy(item, document, beat)

    if (item.layout === 'textRight') section.append(figure, copy)
    else section.append(copy, figure)
    fragment.append(section)
  }
  return fragment
}

export function renderMediaSections(items, document, {case02 = false, onImageError} = {}) {
  const fragment = document.createDocumentFragment()
  if (!Array.isArray(items)) return fragment
  if (case02) return renderCase02MediaSections(items, document, onImageError)

  for (const item of items) {
    if (!hasMediaItem(item)) continue
    const section = document.createElement('section')
    section.className = `detail-media-section detail-media-section-${item.layout}`
    const figure = document.createElement('figure')
    const image = createMediaImage(item, document, '100vw', onImageError)
    figure.append(image)
    section.append(figure)

    const hasHeading = isLocalized(item.heading) && (item.heading.en || item.heading.zh)
    const hasBody = isLocalized(item.body) && (item.body.en || item.body.zh)
    if (hasHeading || hasBody) {
      const copy = document.createElement('div')
      copy.className = 'detail-media-copy'
      if (hasHeading) {
        const heading = document.createElement('h3')
        applyLocalizedNode(heading, item.heading)
        copy.append(heading)
      }
      if (hasBody) {
        const body = document.createElement('p')
        applyLocalizedNode(body, item.body)
        copy.append(body)
      }
      section.append(copy)
    }
    fragment.append(section)
  }
  return fragment
}

function isDetailRecord(record) {
  return record && typeof record === 'object' && isLocalized(record.title) &&
    record.title.en && isSafeCaseImage(record.cover)
}

function applyLocalizedMetadata(node, value, language) {
  if (!node || !isLocalized(value) || !value.en) return false
  node.dataset.enContent = value.en
  node.dataset.zhContent = value.zh || value.en
  node.setAttribute('content', node.dataset[`${language}Content`])
  return true
}

function applySeo(seo, document) {
  if (!seo || !document || typeof document.querySelector !== 'function') return
  const language = document.body?.dataset?.lang === 'zh' ? 'zh' : 'en'
  if (isLocalized(seo.title) && seo.title.en) {
    const title = seo.title[language] || seo.title.en
    document.title = title
    const titleNode = document.querySelector('title')
    if (titleNode) {
      titleNode.dataset.en = seo.title.en
      titleNode.dataset.zh = seo.title.zh || seo.title.en
      titleNode.textContent = title
    }
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      applyLocalizedMetadata(document.querySelector(selector), seo.title, language)
    }
  }
  if (isLocalized(seo.description) && seo.description.en) {
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) applyLocalizedMetadata(document.querySelector(selector), seo.description, language)
  }
  if (isSafeCaseImage(seo.socialImage)) {
    let socialImage = seo.socialImage.src
    if (socialImage.startsWith('/assets/images/')) {
      const base = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || document.baseURI
      try {
        socialImage = String(new URL(socialImage, base))
      } catch {
        return
      }
    }
    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      document.querySelector(selector)?.setAttribute('content', socialImage)
    }
  }
}

function orderedPagination(collection, slug) {
  if (!Array.isArray(collection) || collection.length < 2) return null
  const records = collection.map((record) => ({slug: record?.slug, order: record?.order}))
  if (records.some((record) => !CASE_SLUG.test(record.slug) || !Number.isInteger(record.order))) return null
  const slugs = new Set(records.map((record) => record.slug))
  const orders = new Set(records.map((record) => record.order))
  if (slugs.size !== records.length || orders.size !== records.length) return null
  records.sort((left, right) => left.order - right.order)
  const index = records.findIndex((record) => record.slug === slug)
  if (index < 0) return null
  return {
    previous: records[(index - 1 + records.length) % records.length],
    next: records[(index + 1) % records.length],
  }
}

function applyPagination(collection, record, previous, next) {
  const pagination = orderedPagination(collection, record.slug)
  if (!pagination || !previous || !next) return
  const previousNumber = pagination.previous.slug.slice(5)
  const nextNumber = pagination.next.slug.slice(5)
  previous.setAttribute('href', `./${pagination.previous.slug}.html`)
  applyLocalizedNode(previous, {en: `← CASE ${previousNumber}`, zh: `← 上一案例 ${previousNumber}`})
  next.setAttribute('href', `./${pagination.next.slug}.html`)
  applyLocalizedNode(next, {en: `CASE ${nextNumber} →`, zh: `下一案例 ${nextNumber} →`})
}

export function applyDetailCase(record, root, document = globalThis.document, collection = []) {
  if (!isDetailRecord(record) || !root || !document) return false

  const fields = {
    caseNumber: root.querySelector('[data-cms="caseNumber"]'),
    title: root.querySelector('[data-cms="title"]'),
    subtitle: root.querySelector('[data-cms="subtitle"]'),
    lede: root.querySelector('[data-cms="lede"]'),
    story: root.querySelector('[data-cms="story"]'),
    cover: root.querySelector('[data-cms="cover"]'),
    vehicleModel: root.querySelector('[data-cms="vehicleModel"]'),
    vehicleYear: root.querySelector('[data-cms="vehicleYear"]'),
    media: root.querySelector('[data-cms-media-sections]'),
    previous: root.querySelector('[data-cms-pagination="previous"]'),
    next: root.querySelector('[data-cms-pagination="next"]'),
  }
  const case02Stage = root.querySelector('.case02-video-stage')
  if (!fields.title || !fields.media || (!fields.cover && !case02Stage)) return false

  if (record.caseNumber && fields.caseNumber) fields.caseNumber.textContent = record.caseNumber
  applyLocalizedNode(fields.title, record.title)
  if (record.vehicle?.model && fields.vehicleModel) fields.vehicleModel.textContent = record.vehicle.model
  if (record.vehicle?.year && fields.vehicleYear) fields.vehicleYear.textContent = record.vehicle.year
  for (const name of ['subtitle', 'lede', 'story']) {
    if (isLocalized(record[name]) && record[name].en) applyLocalizedNode(fields[name], record[name])
  }
  if (fields.cover) applyResponsiveImage(fields.cover, record.cover, '(max-width: 768px) 100vw, 50vw')

  const staticMediaChildren = Array.from(fields.media.children || [])
  const restoreStaticMedia = () => fields.media.replaceChildren(...staticMediaChildren)
  const sections = renderMediaSections(record.mediaSections, document, {
    case02: Boolean(case02Stage),
    onImageError: restoreStaticMedia,
  })
  if (sections.children.length) fields.media.replaceChildren(sections)
  applySeo(record.seo, document)
  applyPagination(collection, record, fields.previous, fields.next)
  return true
}

export function loadDetailCase({
  root = globalThis.document?.querySelector('[data-detail-page][data-case-slug]'),
  fetchCases = fetchPublishedCases,
  eventTarget = globalThis.window,
  warn = console.warn,
  document = globalThis.document,
} = {}) {
  const slug = root?.dataset.caseSlug
  if (!slug) return Promise.resolve(false)
  if (notifiedRoots.has(root)) return Promise.resolve(true)
  const pending = pendingRoots.get(root)
  if (pending) return pending

  const load = (async () => {
    try {
      const collection = await fetchCases({slug})
      const record = Array.isArray(collection)
        ? collection.find((candidate) => candidate?.slug === slug)
        : null
      if (!applyDetailCase(record, root, document, collection)) return false
      applyCaseVideo(record, root)
      notifiedRoots.add(root)
      eventTarget.dispatchEvent(new Event('lonma:content-updated'))
      return true
    } catch (error) {
      if (!warnedRoots.has(root)) {
        warn('Unable to load published case content; keeping static page.', error)
        warnedRoots.add(root)
      }
      return false
    } finally {
      pendingRoots.delete(root)
    }
  })()
  pendingRoots.set(root, load)
  return load
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  loadDetailCase()
}
