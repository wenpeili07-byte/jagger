import {fetchPublishedCases} from './sanity-case-data.js'

const warnedRoots = new WeakSet()
const notifiedRoots = new WeakSet()

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

function applyResponsiveImage(image, cover) {
  if (!image || !cover?.src) return
  image.setAttribute('src', cover.src)
  image.dataset.enAlt = cover.alt?.en || ''
  image.dataset.zhAlt = cover.alt?.zh || cover.alt?.en || ''
  image.setAttribute('alt', image.dataset.enAlt)
  if (cover.srcset) image.setAttribute('srcset', cover.srcset)
  else {
    image.removeAttribute('srcset')
    image.removeAttribute('sizes')
  }
  if (Number.isFinite(cover.width)) image.setAttribute('width', String(cover.width))
  if (Number.isFinite(cover.height)) image.setAttribute('height', String(cover.height))
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
    applyResponsiveImage(node.querySelector('[data-cms-cover]'), record.cover)
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
