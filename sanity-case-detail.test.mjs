import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {applyDetailCase, applyResponsiveImage, loadDetailCase, renderMediaSections} from './sanity-case-detail.js'

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName
    this.attributes = new Map()
    this.children = []
    this.dataset = {}
    this.textContent = ''
    this.className = ''
    this.loading = ''
    this.decoding = ''
  }

  append(...nodes) {
    this.children.push(...nodes)
  }

  replaceChildren(...nodes) {
    this.children = nodes.flatMap((node) => node.tagName === '#fragment' ? node.children : [node])
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null
  }

  removeAttribute(name) {
    this.attributes.delete(name)
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }
}

function createFixture() {
  const slots = Object.fromEntries(['caseNumber', 'title', 'subtitle', 'lede', 'story', 'cover'].map((name) => [
    `[data-cms="${name}"]`, new FakeElement(name === 'cover' ? 'img' : 'p'),
  ]))
  slots['[data-cms="title"]'].textContent = 'STATIC TITLE'
  slots['[data-cms="cover"]'].setAttribute('src', '/assets/images/static.jpg')
  slots['[data-cms="cover"]'].setAttribute('srcset', '/assets/images/static-640.jpg 640w')
  slots['[data-cms="cover"]'].setAttribute('sizes', '50vw')
  slots['[data-cms="cover"]'].setAttribute('alt', 'Static alt')
  const media = new FakeElement()
  media.append(new FakeElement('section'))
  const root = {
    dataset: {caseSlug: 'case-01'},
    querySelector(selector) {
      return selector === '[data-cms-media-sections]' ? media : slots[selector] ?? null
    },
  }
  return {root, slots, media}
}

function snapshot({slots, media}) {
  return JSON.stringify({
    slots: Object.fromEntries(Object.entries(slots).map(([selector, node]) => [selector, {
      attributes: [...node.attributes], dataset: node.dataset, textContent: node.textContent,
    }])),
    mediaChildren: media.children.length,
  })
}

const document = {
  createDocumentFragment: () => new FakeElement('#fragment'),
  createElement: (tagName) => new FakeElement(tagName),
}

const record = {
  caseNumber: 'CASE 01',
  title: {en: 'CMS TITLE', zh: 'CMS 标题'},
  subtitle: {en: 'CMS SUBTITLE', zh: 'CMS 副标题'},
  lede: {en: 'CMS LEDE', zh: 'CMS 导语'},
  story: {en: 'CMS STORY', zh: 'CMS 故事'},
  cover: {src: 'https://cdn.sanity.io/images/project/production/cover.jpg', alt: {en: 'Cover EN', zh: '封面'}, width: 1600, height: 900, srcset: 'https://cdn.sanity.io/images/project/production/cover.jpg?w=640 640w'},
  mediaSections: [{
    layout: 'textLeft',
    heading: {en: 'SECTION HEADING', zh: '段落标题'},
    body: {en: 'SECTION BODY', zh: '段落正文'},
    image: {src: '/assets/images/story.jpg', alt: {en: 'Story EN', zh: '故事图片'}},
  }],
}

test('missing or invalid detail records preserve every static node', () => {
  for (const value of [null, {}, {title: record.title}]) {
    const fixture = createFixture()
    const before = snapshot(fixture)
    assert.equal(applyDetailCase(value, fixture.root), false)
    assert.equal(snapshot(fixture), before)
  }
})

test('valid detail content writes bilingual fields, responsive cover, and photo story through DOM APIs', () => {
  const fixture = createFixture()
  assert.equal(applyDetailCase(record, fixture.root, document), true)

  const title = fixture.slots['[data-cms="title"]']
  const cover = fixture.slots['[data-cms="cover"]']
  assert.equal(title.textContent, 'CMS TITLE')
  assert.deepEqual(title.dataset, {en: 'CMS TITLE', zh: 'CMS 标题'})
  assert.equal(cover.getAttribute('src'), record.cover.src)
  assert.equal(cover.getAttribute('srcset'), 'https://cdn.sanity.io/images/project/production/cover.jpg?w=640&auto=format 640w, https://cdn.sanity.io/images/project/production/cover.jpg?w=960&auto=format 960w, https://cdn.sanity.io/images/project/production/cover.jpg?w=1600&auto=format 1600w')
  assert.equal(cover.getAttribute('width'), '1600')
  assert.equal(cover.getAttribute('height'), '900')
  assert.equal(cover.getAttribute('alt'), 'Cover EN')
  assert.deepEqual(cover.dataset, {enAlt: 'Cover EN', zhAlt: '封面'})
  assert.equal(fixture.media.children.length, 1)

  const [section] = fixture.media.children
  assert.equal(section.className, 'detail-media-section detail-media-section-textLeft')
  assert.equal(section.children[0].tagName, 'figure')
  assert.equal(section.children[0].children[0].getAttribute('src'), '/assets/images/story.jpg')
  assert.equal(section.children[0].children[0].getAttribute('srcset'), null)
  assert.equal(section.children[1].children[0].dataset.zh, '段落标题')
  assert.equal(section.children[1].children[1].textContent, 'SECTION BODY')
})

test('empty media does not replace the static media section', () => {
  const fixture = createFixture()
  const originalChild = fixture.media.children[0]
  assert.equal(applyDetailCase({...record, mediaSections: []}, fixture.root, document), true)
  assert.equal(fixture.media.children[0], originalChild)
})

test('local CMS images clear stale responsive and dimension attributes', () => {
  const image = new FakeElement('img')
  image.setAttribute('srcset', '/assets/images/static-640.jpg 640w')
  image.setAttribute('sizes', '50vw')
  image.setAttribute('width', '1920')
  image.setAttribute('height', '1282')

  assert.equal(applyResponsiveImage(image, {
    src: '/assets/images/replacement.jpg',
    alt: {en: 'Replacement', zh: '替换图'},
    srcset: '/assets/images/replacement-640.jpg 640w',
  }), true)
  assert.equal(image.getAttribute('srcset'), null)
  assert.equal(image.getAttribute('sizes'), null)
  assert.equal(image.getAttribute('width'), null)
  assert.equal(image.getAttribute('height'), null)
})

test('Sanity images replace a supplied unsafe srcset with derived candidates', () => {
  const image = new FakeElement('img')
  assert.equal(applyResponsiveImage(image, {
    src: 'https://cdn.sanity.io/images/project/production/cover.jpg',
    alt: {en: 'Cover', zh: '封面'},
    width: 960,
    height: 540,
    srcset: 'javascript:alert(1) 640w',
  }), true)
  assert.equal(image.getAttribute('srcset'), 'https://cdn.sanity.io/images/project/production/cover.jpg?w=640&auto=format 640w, https://cdn.sanity.io/images/project/production/cover.jpg?w=960&auto=format 960w')
  assert.equal(image.getAttribute('sizes'), '100vw')
})

test('unsafe media sections are skipped without replacing static media', () => {
  const unsafeSources = [
    'javascript:alert(1)',
    '/assets/videos/case-01.mp4',
    'https://example.com/story.jpg',
    'https://cdn.sanity.io/images/project/production/story.jpg',
  ]
  for (const src of unsafeSources) {
    const unsafe = {...record.mediaSections[0], image: {src, alt: record.mediaSections[0].image.alt}}
    assert.equal(renderMediaSections([unsafe], document).children.length, 0)
    const fixture = createFixture()
    const staticChild = fixture.media.children[0]
    assert.equal(applyDetailCase({...record, mediaSections: [unsafe]}, fixture.root, document), true)
    assert.equal(fixture.media.children[0], staticChild)
  }
})

test('detail loader fetches, patches, and emits once per successful root', async () => {
  const fixture = createFixture()
  let fetches = 0
  let events = 0
  const options = {
    root: fixture.root,
    document,
    fetchCases: async () => {
      fetches += 1
      return [record]
    },
    eventTarget: {dispatchEvent: () => { events += 1 }},
    warn: () => {},
  }

  assert.equal(await loadDetailCase(options), true)
  assert.equal(await loadDetailCase(options), true)
  assert.equal(fetches, 1)
  assert.equal(events, 1)
})

test('detail loader returns a Promise without side effects when no root exists', async () => {
  let fetches = 0
  let events = 0
  let warnings = 0
  const result = loadDetailCase({
    root: null,
    fetchCases: async () => { fetches += 1; return [record] },
    eventTarget: {dispatchEvent: () => { events += 1 }},
    warn: () => { warnings += 1 },
  })

  assert.equal(typeof result?.then, 'function')
  assert.equal(await result, false)
  assert.equal(fetches, 0)
  assert.equal(events, 0)
  assert.equal(warnings, 0)
})

test('detail loader returns a Promise without side effects when a root has no slug', async () => {
  const fixture = createFixture()
  delete fixture.root.dataset.caseSlug
  const before = snapshot(fixture)
  let fetches = 0
  let events = 0
  let warnings = 0
  const result = loadDetailCase({
    root: fixture.root,
    document,
    fetchCases: async () => { fetches += 1; return [record] },
    eventTarget: {dispatchEvent: () => { events += 1 }},
    warn: () => { warnings += 1 },
  })

  assert.equal(typeof result?.then, 'function')
  assert.equal(await result, false)
  assert.equal(snapshot(fixture), before)
  assert.equal(fetches, 0)
  assert.equal(events, 0)
  assert.equal(warnings, 0)
})

test('detail loader shares one in-flight request for concurrent calls', async () => {
  const fixture = createFixture()
  let fetches = 0
  let release
  const options = {
    root: fixture.root,
    document,
    fetchCases: () => {
      fetches += 1
      return new Promise((resolve) => { release = () => resolve([record]) })
    },
    eventTarget: {dispatchEvent: () => {}},
    warn: () => {},
  }

  const first = loadDetailCase(options)
  const second = loadDetailCase(options)
  assert.equal(first, second)
  assert.equal(fetches, 1)
  release()
  assert.equal(await first, true)
})

test('detail loader completes before synchronous update listeners can reenter', async () => {
  const fixture = createFixture()
  let fetches = 0
  let events = 0
  let reentrant
  const options = {
    root: fixture.root,
    document,
    fetchCases: async () => {
      fetches += 1
      return [record]
    },
    eventTarget: {
      dispatchEvent: () => {
        events += 1
        reentrant = loadDetailCase(options)
      },
    },
    warn: () => {},
  }

  assert.equal(await loadDetailCase(options), true)
  assert.equal(await reentrant, true)
  assert.equal(fetches, 1)
  assert.equal(events, 1)
})

test('detail loader warns once when repeated requests fail', async () => {
  const fixture = createFixture()
  let fetches = 0
  let warnings = 0
  const options = {
    root: fixture.root,
    document,
    fetchCases: async () => {
      fetches += 1
      throw new Error('offline')
    },
    eventTarget: {dispatchEvent: () => assert.fail('failure must not emit an update')},
    warn: () => { warnings += 1 },
  }

  assert.equal(await loadDetailCase(options), false)
  assert.equal(await loadDetailCase(options), false)
  assert.equal(fetches, 2)
  assert.equal(warnings, 1)
})

test('media renderer creates no markup strings', () => {
  const source = readFileSync(new URL('./sanity-case-detail.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /innerHTML/)
  const fragment = renderMediaSections(record.mediaSections, document)
  assert.equal(fragment.children.length, 1)
})
