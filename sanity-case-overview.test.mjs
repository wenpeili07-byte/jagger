import assert from 'node:assert/strict'
import test from 'node:test'
import {applyCasesOverview, loadCasesOverview} from './sanity-case-overview.js'

const records = [1, 2, 3, 4, 5, 6].map((number) => ({
  slug: `case-0${number}`,
  order: 7 - number,
  brand: number === 3 ? 'mercedes-benz' : number === 5 ? 'audi' : 'bmw',
  caseNumber: `CASE 0${number}`,
  title: {en: `TITLE ${number}`, zh: `标题 ${number}`},
  vehicle: {make: `MAKE ${number}`, model: `MODEL ${number}`, year: '2026', chassis: '', specification: ''},
  cover: {src: `/assets/images/case-0${number}.jpg`, alt: {en: `Car ${number}`, zh: `车辆 ${number}`}},
}))

class FakeParent {
  constructor(children) {
    this.children = [...children]
    this.children.forEach((child) => {
      child.parentNode = this
    })
  }

  insertBefore(node, reference) {
    this.remove(node)
    if (reference === null) this.children.push(node)
    else this.children.splice(this.children.indexOf(reference), 0, node)
    node.parentNode = this
  }

  appendChild(node) {
    this.remove(node)
    this.children.push(node)
    node.parentNode = this
  }

  remove(node) {
    const index = this.children.indexOf(node)
    if (index >= 0) this.children.splice(index, 1)
  }
}

class FakeNode {
  constructor(slug, slots = {}, spacer = false) {
    this.dataset = slug ? {caseSlug: slug} : {}
    this.slots = slots
    this.textContent = ''
    this.attributes = new Map()
    this.listeners = new Map()
    this.style = {objectPosition: ''}
    this.classList = {contains: (name) => spacer && name === 'spacer'}
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener)
  }

  dispatch(name) {
    this.listeners.get(name)?.()
  }

  querySelector(selector) {
    return this.slots[selector] || null
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }

  getAttribute(name) {
    return this.attributes.get(name) || null
  }

  removeAttribute(name) {
    this.attributes.delete(name)
  }
}

function caseNode(slug) {
  return new FakeNode(slug, {
    '[data-cms-title]': new FakeNode(),
    '[data-cms-rail-title]': new FakeNode(),
    '[data-cms-brand]': new FakeNode(),
    '[data-cms-vehicle]': new FakeNode(),
    '[data-cms-cover]': new FakeNode(),
  })
}

test('updates only existing matching case nodes with localized CMS content', () => {
  const railCases = records.map(({slug}) => caseNode(slug))
  const archiveCases = records.map(({slug}) => caseNode(slug))
  const rail = new FakeParent([new FakeNode('', {}, true), new FakeNode('', {}, true), ...railCases, new FakeNode('', {}, true), new FakeNode('', {}, true)])
  const archive = new FakeParent(archiveCases)
  const root = {
    querySelectorAll: (selector) => selector === '[data-case-slug]' ? [...railCases, ...archiveCases, caseNode('case-36')] : [],
    querySelector: (selector) => selector === '.mwg_effect060 .slides' ? rail : selector === '.archive-grid' ? archive : null,
  }

  assert.equal(applyCasesOverview(records, root), 6)
  assert.equal(archive.children.length, 6, 'existing archive cards should be reused without creating a seventh card')
  assert.deepEqual(rail.children.slice(0, 2).map((node) => node.dataset.caseSlug), [undefined, undefined], 'leading rail spacers should remain in place')
  assert.deepEqual(rail.children.slice(-2).map((node) => node.dataset.caseSlug), [undefined, undefined], 'trailing rail spacers should remain in place')
  assert.deepEqual(archive.children.map((node) => node.dataset.caseSlug), ['case-06', 'case-05', 'case-04', 'case-03', 'case-02', 'case-01'])

  const updated = archiveCases[0]
  assert.equal(updated.dataset.brand, 'bmw')
  assert.equal(updated.slots['[data-cms-title]'].textContent, 'TITLE 1')
  assert.equal(updated.slots['[data-cms-title]'].dataset.en, 'TITLE 1')
  assert.equal(updated.slots['[data-cms-title]'].dataset.zh, '标题 1')
  assert.equal(updated.slots['[data-cms-cover]'].getAttribute('src'), '/assets/images/case-01.jpg')
  assert.equal(updated.slots['[data-cms-rail-title]'].dataset.en, '01 · TITLE 1')
  assert.equal(updated.slots['[data-cms-rail-title]'].dataset.zh, '01 · 标题 1')
})

test('leaves static nodes untouched when no supplied record matches a case slug', () => {
  const card = caseNode('case-01')
  const root = {
    querySelectorAll: () => [card],
    querySelector: () => null,
  }

  assert.equal(applyCasesOverview([{...records[0], slug: 'case-36'}], root), 0)
  assert.equal(card.dataset.brand, undefined)
  assert.equal(card.slots['[data-cms-title]'].textContent, '')
})

test('keeps static content on empty or failed overview requests', async () => {
  let queried = 0
  let dispatched = 0
  let warnings = 0
  const root = {
    querySelectorAll: () => {
      queried += 1
      return []
    },
    querySelector: () => null,
  }
  const eventTarget = {dispatchEvent: () => { dispatched += 1 }}

  assert.equal(await loadCasesOverview({fetchCases: async () => [], root, eventTarget, warn: () => { warnings += 1 }}), 0)
  assert.equal(queried, 0, 'empty normalized results should not query or write to static DOM')
  assert.equal(dispatched, 0)
  assert.equal(await loadCasesOverview({fetchCases: async () => { throw new Error('offline') }, root, eventTarget, warn: () => { warnings += 1 }}), 0)
  assert.equal(warnings, 1, 'a request error should produce one fallback warning')
  assert.equal(dispatched, 0)
})

test('notifies and warns once per overview root lifecycle', async () => {
  let warnings = 0
  const failedRoot = {querySelectorAll: () => [], querySelector: () => null}
  const warn = () => { warnings += 1 }

  await loadCasesOverview({fetchCases: async () => { throw new Error('offline') }, root: failedRoot, eventTarget: {}, warn})
  await loadCasesOverview({fetchCases: async () => { throw new Error('offline') }, root: failedRoot, eventTarget: {}, warn})
  assert.equal(warnings, 1, 'a repeated request failure should warn only once for its root')

  let dispatched = 0
  const card = caseNode('case-01')
  const successfulRoot = {
    querySelectorAll: () => [card],
    querySelector: () => null,
  }
  const eventTarget = {dispatchEvent: () => { dispatched += 1 }}

  await loadCasesOverview({fetchCases: async () => records, root: successfulRoot, eventTarget, warn})
  await loadCasesOverview({fetchCases: async () => records, root: successfulRoot, eventTarget, warn})
  assert.equal(dispatched, 1, 'a repeated successful update should notify only once for its root')
})

test('preserves seeded responsive cover attributes when the CMS local path matches', () => {
  const card = caseNode('case-01')
  const cover = card.slots['[data-cms-cover]']
  cover.setAttribute('src', '../assets/images/case-01.jpg')
  cover.setAttribute('srcset', '../assets/images/generated/case-01-640w.webp 640w, ../assets/images/generated/case-01-960w.webp 960w')
  cover.setAttribute('sizes', '(max-width: 768px) 50vw, 25vw')
  cover.setAttribute('width', '1920')
  cover.setAttribute('height', '1282')
  const root = {
    querySelectorAll: () => [card],
    querySelector: () => null,
  }

  assert.equal(applyCasesOverview([records[0]], root), 1)
  assert.equal(cover.getAttribute('src'), '../assets/images/case-01.jpg')
  assert.equal(cover.getAttribute('srcset'), '../assets/images/generated/case-01-640w.webp 640w, ../assets/images/generated/case-01-960w.webp 960w')
  assert.equal(cover.getAttribute('sizes'), '(max-width: 768px) 50vw, 25vw')
  assert.equal(cover.getAttribute('width'), '1920')
  assert.equal(cover.getAttribute('height'), '1282')
  assert.equal(cover.dataset.enAlt, 'Car 1')
  assert.equal(cover.dataset.zhAlt, '车辆 1')
  assert.equal(cover.getAttribute('alt'), 'Car 1')
})

test('restores static cover attributes and rail scene when a CMS replacement fails', () => {
  const railCard = caseNode('case-01')
  railCard.dataset.scene = '../assets/images/generated/case-01/case-01-1600w.webp'
  const cover = railCard.slots['[data-cms-cover]']
  const staticAttributes = {
    src: '../assets/images/网页/optimized/case-01.jpg',
    srcset: '../assets/images/generated/case-01/case-01-640w.webp 640w, ../assets/images/generated/case-01/case-01-1600w.webp 1600w',
    sizes: '(max-width: 1180px) 84vw, 50vw',
    width: '1920',
    height: '1282',
    alt: 'Static cover',
  }
  for (const [name, value] of Object.entries(staticAttributes)) cover.setAttribute(name, value)
  cover.dataset.enAlt = 'Static cover'
  cover.dataset.zhAlt = '静态封面'
  const replacement = {
    ...records[0],
    cover: {
      src: 'https://cdn.sanity.io/images/project/production/replacement.jpg',
      srcset: 'https://cdn.sanity.io/images/project/production/replacement.jpg?w=640 640w',
      width: 1600,
      height: 900,
      alt: {en: 'CMS cover', zh: 'CMS 封面'},
    },
  }
  const root = {
    querySelectorAll: () => [railCard],
    querySelector: () => null,
  }

  assert.equal(applyCasesOverview([replacement], root), 1)
  assert.equal(cover.getAttribute('src'), replacement.cover.src)
  assert.equal(railCard.dataset.scene, replacement.cover.src)

  cover.dispatch('error')

  for (const [name, value] of Object.entries(staticAttributes)) {
    assert.equal(cover.getAttribute(name), value, `${name} should return to its static fallback`)
  }
  assert.equal(cover.dataset.enAlt, 'Static cover')
  assert.equal(cover.dataset.zhAlt, '静态封面')
  assert.equal(railCard.dataset.scene, '../assets/images/generated/case-01/case-01-1600w.webp')
})

test('overview covers apply and restore safe Sanity hotspot positions', () => {
  const card = caseNode('case-01')
  const cover = card.slots['[data-cms-cover]']
  cover.setAttribute('src', '../assets/images/static.jpg')
  cover.style.objectPosition = '50% 50%'
  const root = {querySelectorAll: () => [card], querySelector: () => null}
  const replacement = {
    ...records[0],
    cover: {
      src: 'https://cdn.sanity.io/images/project/production/replacement.jpg',
      srcset: 'https://cdn.sanity.io/images/project/production/replacement.jpg?w=640 640w',
      width: 1600,
      height: 900,
      objectPosition: '72% 38%',
      alt: {en: 'CMS cover', zh: 'CMS 封面'},
    },
  }

  assert.equal(applyCasesOverview([replacement], root), 1)
  assert.equal(cover.style.objectPosition, '72% 38%')
  cover.dispatch('error')
  assert.equal(cover.style.objectPosition, '50% 50%')
})
