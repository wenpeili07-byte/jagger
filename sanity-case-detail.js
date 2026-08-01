import {buildResponsiveSanitySrcset, fetchPublishedCases, isSafeCaseImage} from './sanity-case-data.js'

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
    media: root.querySelector('[data-cms-media-sections]'),
  }
  if (!fields.title || !fields.cover || !fields.media) return false

  if (record.caseNumber && fields.caseNumber) fields.caseNumber.textContent = record.caseNumber
  applyLocalizedNode(fields.title, record.title)
  for (const name of ['subtitle', 'lede', 'story']) {
    if (isLocalized(record[name]) && record[name].en) applyLocalizedNode(fields[name], record[name])
  }
  applyResponsiveImage(fields.cover, record.cover, '(max-width: 768px) 100vw, 50vw')

  const sections = renderMediaSections(record.mediaSections, document)
  if (sections.children.length) fields.media.replaceChildren(sections)
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
