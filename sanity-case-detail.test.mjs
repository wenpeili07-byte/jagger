import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {applyDetailCase, renderMediaSections} from './sanity-case-detail.js'

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
  assert.equal(cover.getAttribute('srcset'), record.cover.srcset)
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

test('media renderer creates no markup strings', () => {
  const source = readFileSync(new URL('./sanity-case-detail.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /innerHTML/)
  const fragment = renderMediaSections(record.mediaSections, document)
  assert.equal(fragment.children.length, 1)
})
