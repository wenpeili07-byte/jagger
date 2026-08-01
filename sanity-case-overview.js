import {fetchPublishedCases} from './sanity-case-data.js'

const warnedRoots = new WeakSet()
const notifiedRoots = new WeakSet()
const imageFallbacks = new WeakMap()
const IMAGE_ATTRIBUTES = ['src', 'srcset', 'sizes', 'width', 'height', 'alt']
const OBJECT_POSITION = /^(?:100|\d{1,2})(?:\.\d{1,2})?% (?:100|\d{1,2})(?:\.\d{1,2})?%$/

function applyLocalizedNode(node, value) {
  if (!node || !value?.en) return
  node.dataset.en = value.en
  node.dataset.zh = value.zh || value.en
  node.textContent = value.en
}

function applyTextNode(node, value) {
  if (!node || !value) return
  node.dataset.en = value
  node.dataset.zh = value
  node.textContent = value
}

function vehicleLabel(vehicle) {
  if (!vehicle) return ''
  return [vehicle.make, vehicle.model, vehicle.year, vehicle.chassis, vehicle.specification]
    .filter(Boolean)
    .join(' · ')
}

function localAssetPath(source) {
  if (typeof source !== 'string') return ''
  try {
    const url = new URL(source, 'https://lonma.local/pages/cases.html')
    return url.origin === 'https://lonma.local' && url.pathname.startsWith('/assets/images/')
      ? url.pathname
      : ''
  } catch {
    return ''
  }
}

function snapshotAttribute(node, name) {
  const value = node.getAttribute(name)
  return {present: value !== null, value}
}

function restoreAttribute(node, name, snapshot) {
  if (snapshot.present) node.setAttribute(name, snapshot.value)
  else node.removeAttribute(name)
}

function snapshotDatasetValue(node, name) {
  return {present: Object.hasOwn(node.dataset, name), value: node.dataset[name]}
}

function restoreDatasetValue(node, name, snapshot) {
  if (snapshot.present) node.dataset[name] = snapshot.value
  else delete node.dataset[name]
}

function getImageFallback(image, sceneNode) {
  let fallback = imageFallbacks.get(image)
  if (fallback) return fallback

  fallback = {
    active: false,
    attributes: new Map(IMAGE_ATTRIBUTES.map((name) => [name, snapshotAttribute(image, name)])),
    enAlt: snapshotDatasetValue(image, 'enAlt'),
    zhAlt: snapshotDatasetValue(image, 'zhAlt'),
    objectPosition: image.style?.objectPosition || '',
    sceneNode,
    scene: sceneNode ? snapshotDatasetValue(sceneNode, 'scene') : null,
  }
  imageFallbacks.set(image, fallback)
  image.addEventListener('error', () => {
    if (!fallback.active) return
    fallback.active = false
    for (const [name, snapshot] of fallback.attributes) restoreAttribute(image, name, snapshot)
    restoreDatasetValue(image, 'enAlt', fallback.enAlt)
    restoreDatasetValue(image, 'zhAlt', fallback.zhAlt)
    if (image.style) image.style.objectPosition = fallback.objectPosition
    if (fallback.sceneNode && fallback.scene) {
      restoreDatasetValue(fallback.sceneNode, 'scene', fallback.scene)
    }
  })
  return fallback
}

function applyResponsiveImage(image, cover, sceneNode) {
  if (!image || !cover?.src) return

  const currentLocalPath = localAssetPath(image.getAttribute('src'))
  const nextLocalPath = localAssetPath(cover.src)
  const matchesStaticLocalImage = currentLocalPath && currentLocalPath === nextLocalPath
  if (!matchesStaticLocalImage) {
    const fallback = getImageFallback(image, sceneNode)
    fallback.active = true
    image.setAttribute('src', cover.src)
    if (cover.srcset) image.setAttribute('srcset', cover.srcset)
    else {
      image.removeAttribute('srcset')
      image.removeAttribute('sizes')
    }
    if (Number.isFinite(cover.width)) image.setAttribute('width', String(cover.width))
    if (Number.isFinite(cover.height)) image.setAttribute('height', String(cover.height))
    if (image.style) {
      image.style.objectPosition = OBJECT_POSITION.test(cover.objectPosition) ? cover.objectPosition : ''
    }
    if (sceneNode) sceneNode.dataset.scene = cover.src
  }

  image.dataset.enAlt = cover.alt?.en || ''
  image.dataset.zhAlt = cover.alt?.zh || cover.alt?.en || ''
  image.setAttribute('alt', image.dataset.enAlt)
}

function filterBrand(brand) {
  return brand === 'mercedes-benz' ? 'benz' : brand
}

function reorderNodes(nodes, records, parent, reference) {
  if (!parent) return
  const nodesBySlug = new Map(nodes.map((node) => [node.dataset.caseSlug, node]))
  for (const record of records) {
    const node = nodesBySlug.get(record.slug)
    if (node) parent.insertBefore(node, reference || null)
  }
}

export function applyCasesOverview(records, root = document) {
  if (!Array.isArray(records) || records.length === 0 || !root) return 0

  const bySlug = new Map(records.map((record) => [record.slug, record]))
  const matched = [...root.querySelectorAll('[data-case-slug]')]
    .filter((node) => bySlug.has(node.dataset.caseSlug))
  if (matched.length === 0) return 0

  for (const node of matched) {
    const record = bySlug.get(node.dataset.caseSlug)
    node.dataset.brand = filterBrand(record.brand)
    applyLocalizedNode(node.querySelector('[data-cms-title]'), record.title)
    applyLocalizedNode(node.querySelector('[data-cms-rail-title]'), {
      en: `${record.caseNumber.replace('CASE ', '')} · ${record.title.en}`,
      zh: `${record.caseNumber.replace('CASE ', '')} · ${record.title.zh}`,
    })
    applyTextNode(node.querySelector('[data-cms-brand]'), record.brand.toUpperCase())
    applyTextNode(node.querySelector('[data-cms-vehicle]'), vehicleLabel(record.vehicle))
    const sceneNode = node.dataset.scene === undefined ? null : node
    applyResponsiveImage(node.querySelector('[data-cms-cover]'), record.cover, sceneNode)
  }

  const ordered = [...bySlug.values()].filter((record) => matched.some((node) => node.dataset.caseSlug === record.slug))
    .sort((left, right) => left.order - right.order)
  const rail = root.querySelector('.mwg_effect060 .slides')
  const archive = root.querySelector('.archive-grid')
  const railNodes = matched.filter((node) => node.parentNode === rail)
  const archiveNodes = matched.filter((node) => node.parentNode === archive)
  const trailingSpacer = rail && [...rail.children].find((node, index, children) => index > 1 && node.classList?.contains('spacer'))
  reorderNodes(railNodes, ordered, rail, trailingSpacer)
  reorderNodes(archiveNodes, ordered, archive)

  return new Set(matched.map((node) => node.dataset.caseSlug)).size
}

export async function loadCasesOverview({
  fetchCases = fetchPublishedCases,
  root = document,
  eventTarget = window,
  warn = console.warn,
} = {}) {
  const trackRoot = root && (typeof root === 'object' || typeof root === 'function')
  try {
    const records = await fetchCases()
    if (records.length === 0) return 0
    const updated = applyCasesOverview(records, root)
    if (updated > 0 && (!trackRoot || !notifiedRoots.has(root))) {
      eventTarget.dispatchEvent(new Event('lonma:content-updated'))
      if (trackRoot) notifiedRoots.add(root)
    }
    return updated
  } catch {
    if (!trackRoot || !warnedRoots.has(root)) {
      warn('Sanity case overview unavailable; using static content.')
      if (trackRoot) warnedRoots.add(root)
    }
    return 0
  }
}

if (typeof document !== 'undefined') {
  loadCasesOverview()
}
