import {buildResponsiveSanitySrcset, fetchPublishedCases, isSafeCaseImage, isSafeCaseVideoUrl} from './sanity-case-data.js'

const warnedRoots = new WeakSet()
const notifiedRoots = new WeakSet()
const pendingRoots = new WeakMap()

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

export function applyResponsiveImage(image, source, sizes = '100vw') {
  if (!image || !isSafeCaseImage(source)) return false

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
  if (isLocalized(source.alt)) {
    image.dataset.enAlt = source.alt.en
    image.dataset.zhAlt = source.alt.zh
    image.setAttribute('alt', source.alt.en)
  }
  return true
}

function applyCaseVideoPoster(video, poster) {
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
  return true
}

function caseVideoSource(video) {
  if (isSafeCaseVideoUrl(video?.fileUrl)) return video.fileUrl
  return typeof video?.externalUrl === 'string' && video.externalUrl.startsWith('https://') &&
    isSafeCaseVideoUrl(video.externalUrl) ? video.externalUrl : ''
}

export function applyCaseVideo(record, root) {
  const source = caseVideoSource(record?.video)
  const stage = root?.querySelector('.case02-video-stage')
  const video = root?.querySelector('[data-case-video]')
  if (!source || !stage || !video) return false

  video.setAttribute('src', source)
  globalThis.window?.lonmaRefreshCaseVideoState?.()
  applyCaseVideoPoster(video, record.video.poster)
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

export function renderMediaSections(items, document) {
  const fragment = document.createDocumentFragment()
  if (!Array.isArray(items)) return fragment

  for (const item of items) {
    if (!hasMediaItem(item)) continue
    const section = document.createElement('section')
    section.className = `detail-media-section detail-media-section-${item.layout}`
    const figure = document.createElement('figure')
    const image = document.createElement('img')
    image.loading = 'lazy'
    image.decoding = 'async'
    applyResponsiveImage(image, item.image)
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

export function applyDetailCase(record, root, document = globalThis.document) {
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
  }
  if (!fields.title || !fields.media || (!fields.cover && !root.querySelector('.case02-video-stage'))) return false

  if (record.caseNumber && fields.caseNumber) fields.caseNumber.textContent = record.caseNumber
  applyLocalizedNode(fields.title, record.title)
  if (record.vehicle?.model && fields.vehicleModel) fields.vehicleModel.textContent = record.vehicle.model
  if (record.vehicle?.year && fields.vehicleYear) fields.vehicleYear.textContent = record.vehicle.year
  for (const name of ['subtitle', 'lede', 'story']) {
    if (isLocalized(record[name]) && record[name].en) applyLocalizedNode(fields[name], record[name])
  }
  if (fields.cover) applyResponsiveImage(fields.cover, record.cover, '(max-width: 768px) 100vw, 50vw')

  const sections = renderMediaSections(record.mediaSections, document)
  if (sections.children.length && !root.querySelector('.case02-video-stage')) fields.media.replaceChildren(sections)
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
      const [record] = await fetchCases({slug})
      if (!applyDetailCase(record, root, document)) return false
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
