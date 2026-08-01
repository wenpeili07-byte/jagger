import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {applyCaseVideo, applyDetailCase, applyResponsiveImage, loadDetailCase, renderMediaSections} from './sanity-case-detail.js'

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
    this.style = {}
    this.listeners = new Map()
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

  addEventListener(name, listener, options = {}) {
    this.listeners.set(name, {listener, once: options.once === true})
  }

  dispatch(name) {
    const entry = this.listeners.get(name)
    if (!entry) return
    entry.listener({type: name, target: this})
    if (entry.once) this.listeners.delete(name)
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
  const previous = new FakeElement('a')
  previous.setAttribute('href', './case-06.html')
  previous.dataset.en = 'STATIC PREVIOUS'
  previous.dataset.zh = '静态上一案例'
  previous.textContent = 'STATIC PREVIOUS'
  const next = new FakeElement('a')
  next.setAttribute('href', './case-02.html')
  next.dataset.en = 'STATIC NEXT'
  next.dataset.zh = '静态下一案例'
  next.textContent = 'STATIC NEXT'
  const root = {
    dataset: {caseSlug: 'case-01'},
    querySelector(selector) {
      return selector === '[data-cms-media-sections]' ? media : slots[selector] ?? null
    },
  }
  const originalQuerySelector = root.querySelector.bind(root)
  root.querySelector = (selector) => {
    if (selector === '[data-cms-pagination="previous"]') return previous
    if (selector === '[data-cms-pagination="next"]') return next
    return originalQuerySelector(selector)
  }
  return {root, slots, media, previous, next}
}

function createCase02Fixture() {
  const stage = new FakeElement('section')
  stage.dataset.videoState = 'poster-only'
  const video = new FakeElement('video')
  video.setAttribute('poster', '/assets/images/static-poster.jpg')
  video.setAttribute('controls', '')
  video.setAttribute('aria-disabled', 'true')
  let loads = 0
  let pauses = 0
  video.load = () => { loads += 1 }
  video.pause = () => { pauses += 1 }
  const root = {
    querySelector(selector) {
      if (selector === '.case02-video-stage') return stage
      if (selector === '[data-case-video]') return video
      return null
    },
  }
  return {root, stage, video, loads: () => loads, pauses: () => pauses}
}

function createCase02DetailFixture() {
  const fixture = createFixture()
  const videoFixture = createCase02Fixture()
  fixture.root.dataset.caseSlug = 'case-02'
  const querySelector = fixture.root.querySelector.bind(fixture.root)
  fixture.root.querySelector = (selector) => {
    if (selector === '.case02-video-stage' || selector === '[data-case-video]') {
      return videoFixture.root.querySelector(selector)
    }
    return querySelector(selector)
  }
  return {...fixture, ...videoFixture, root: fixture.root}
}

function snapshot({slots, media}) {
  return JSON.stringify({
    slots: Object.fromEntries(Object.entries(slots).map(([selector, node]) => [selector, {
      attributes: [...node.attributes], dataset: node.dataset, textContent: node.textContent,
    }])),
    mediaChildren: media.children.length,
  })
}

function descendants(node) {
  return [node, ...(node?.children || []).flatMap(descendants)]
}

const document = {
  createDocumentFragment: () => new FakeElement('#fragment'),
  createElement: (tagName) => new FakeElement(tagName),
}

const record = {
  slug: 'case-01',
  order: 1,
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

test('matching local CMS images preserve the static responsive source attributes and dimensions', () => {
  const image = new FakeElement('img')
  image.baseURI = 'https://jagger-sage.vercel.app/pages/cases/case-01.html'
  image.setAttribute('src', '../../assets/images/网页/optimized/case-01.jpg')
  image.setAttribute('srcset', '/assets/images/static-640.jpg 640w')
  image.setAttribute('sizes', '50vw')
  image.setAttribute('width', '1920')
  image.setAttribute('height', '1282')

  assert.equal(applyResponsiveImage(image, {
    src: '/assets/images/网页/optimized/case-01.jpg',
    alt: {en: 'Updated alt', zh: '更新图片'},
  }), true)
  assert.equal(image.getAttribute('src'), '../../assets/images/网页/optimized/case-01.jpg')
  assert.equal(image.getAttribute('srcset'), '/assets/images/static-640.jpg 640w')
  assert.equal(image.getAttribute('sizes'), '50vw')
  assert.equal(image.getAttribute('width'), '1920')
  assert.equal(image.getAttribute('height'), '1282')
  assert.equal(image.getAttribute('alt'), 'Updated alt')
})

test('changed images restore the complete static responsive source snapshot on error', () => {
  const image = new FakeElement('img')
  image.setAttribute('src', '../../assets/images/static.jpg')
  image.setAttribute('srcset', '../../assets/images/static-640.webp 640w')
  image.setAttribute('sizes', '50vw')
  image.setAttribute('width', '1920')
  image.setAttribute('height', '1282')
  image.setAttribute('alt', 'Static alt')
  image.setAttribute('data-en-alt', 'Static alt')
  image.setAttribute('data-zh-alt', '静态图片')
  const before = [...image.attributes]

  assert.equal(applyResponsiveImage(image, {
    src: '/assets/images/replacement.jpg',
    alt: {en: 'Replacement', zh: '替换图'},
  }), true)
  assert.equal(image.getAttribute('src'), '/assets/images/replacement.jpg')
  assert.equal(image.getAttribute('srcset'), null)

  image.dispatch('error')
  assert.deepEqual([...image.attributes], before)
})

test('uploaded images apply only normalized object-position values', () => {
  const image = new FakeElement('img')
  image.style.objectPosition = '20% 80%'

  assert.equal(applyResponsiveImage(image, {
    src: 'https://cdn.sanity.io/images/project/production/cover.jpg',
    alt: {en: 'Cover', zh: '封面'},
    width: 960,
    height: 540,
    objectPosition: '64.29% 43.75%',
  }), true)
  assert.equal(image.style.objectPosition, '64.29% 43.75%')

  assert.equal(applyResponsiveImage(image, {
    src: '/assets/images/local.jpg',
    alt: {en: 'Local', zh: '本地图片'},
    objectPosition: '0% 0%',
  }), true)
  assert.equal(image.style.objectPosition, '64.29% 43.75%')
})

test('Case 02 keeps its approved story hierarchy when CMS media sections replace static content', () => {
  const fixture = createCase02DetailFixture()
  const mediaSections = [
    record.mediaSections[0],
    {...record.mediaSections[0], layout: 'textRight', heading: {en: 'TEST, ADJUST, REPEAT', zh: '测试、调整、再测试'}},
    {...record.mediaSections[0], layout: 'full', heading: {en: 'FULL WIDTH NOTE', zh: '全宽说明'}},
    {...record.mediaSections[0], layout: 'full', heading: {en: '', zh: ''}, body: {en: '', zh: ''}},
  ]
  assert.equal(applyDetailCase({...record, slug: 'case-02', mediaSections}, fixture.root, document), true)
  assert.equal(fixture.media.children.length, 4)
  assert.equal(fixture.media.children[0].className, 'case02-story-beat case02-story-beat-direction')
  assert.equal(fixture.media.children[0].children[0].className, 'case02-story-copy')
  assert.equal(fixture.media.children[0].children[0].children[1].tagName, 'h2')
  assert.equal(fixture.media.children[1].className, 'case02-story-beat case02-story-beat-test')
  assert.equal(fixture.media.children[1].children[0].className, 'case02-story-media')
  assert.equal(fixture.media.children[2].className, 'case02-story-full')
  assert.equal(fixture.media.children[2].children[0].className, 'case02-story-copy')
  assert.equal(fixture.media.children[2].children[0].children[1].textContent, 'FULL WIDTH NOTE')
  assert.equal(fixture.media.children[2].children[1].className, 'case02-story-media case02-story-wide')
  assert.equal(fixture.media.children[3].className, 'case02-story-media case02-story-wide')
})

test('a failed CMS story image restores the complete static Case 02 story', () => {
  const fixture = createCase02DetailFixture()
  const staticStory = fixture.media.children[0]
  const cmsRecord = {
    ...record,
    slug: 'case-02',
    mediaSections: [{
      ...record.mediaSections[0],
      image: {
        src: 'https://cdn.sanity.io/images/project/production/story.jpg',
        width: 1600,
        height: 900,
        alt: {en: 'CMS story', zh: 'CMS 故事'},
      },
    }],
  }

  assert.equal(applyDetailCase(cmsRecord, fixture.root, document), true)
  const cmsImage = descendants(fixture.media.children[0]).find((node) => node.tagName === 'img')
  assert.ok(cmsImage)
  cmsImage.dispatch('error')
  assert.deepEqual(fixture.media.children, [staticStory])
})

test('Case 02 keeps its poster-only DOM byte-for-byte without a safe CMS video source', () => {
  const fixture = createCase02Fixture()
  const before = JSON.stringify({
    stage: fixture.stage.dataset,
    video: [...fixture.video.attributes],
  })

  assert.equal(applyCaseVideo({video: {poster: null, fileUrl: '', externalUrl: ''}}, fixture.root), false)
  assert.equal(JSON.stringify({
    stage: fixture.stage.dataset,
    video: [...fixture.video.attributes],
  }), before)
  assert.equal(fixture.loads(), 0)
  assert.equal(fixture.pauses(), 0)
})

test('Case 02 accepts a safe CMS poster without an MP4 and remains paused and poster-only', () => {
  const fixture = createCase02Fixture()
  fixture.video.play = () => assert.fail('poster-only CMS updates must not autoplay')

  assert.equal(applyCaseVideo({video: {
    poster: {src: '/assets/images/case-02-poster.jpg', alt: {en: 'Poster EN', zh: '海报'}},
    fileUrl: '',
    externalUrl: '',
  }}, fixture.root), true)
  assert.equal(fixture.video.getAttribute('poster'), '/assets/images/case-02-poster.jpg')
  assert.equal(fixture.stage.dataset.videoState, 'poster-only')
  assert.equal(fixture.video.getAttribute('controls'), null)
  assert.equal(fixture.video.getAttribute('aria-disabled'), 'true')
  assert.equal(fixture.loads(), 0)
  assert.equal(fixture.pauses(), 1)
})

test('Case 02 preloads a Sanity poster and preserves the static poster if loading fails', () => {
  const fixture = createCase02Fixture()
  let preload
  class FakeImage {
    constructor() {
      preload = this
      this.listeners = new Map()
    }
    addEventListener(name, listener) {
      this.listeners.set(name, listener)
    }
    set src(value) {
      this.source = value
    }
    dispatch(name) {
      this.listeners.get(name)?.()
    }
  }
  const poster = {
    src: 'https://cdn.sanity.io/images/project/production/poster.jpg',
    width: 1600,
    height: 900,
    objectPosition: '70% 35%',
    alt: {en: 'CMS poster', zh: 'CMS 海报'},
  }

  assert.equal(applyCaseVideo({video: {poster}}, fixture.root, {ImageCtor: FakeImage}), true)
  assert.equal(fixture.video.getAttribute('poster'), '/assets/images/static-poster.jpg')
  preload.dispatch('error')
  assert.equal(fixture.video.getAttribute('poster'), '/assets/images/static-poster.jpg')
  assert.equal(fixture.video.style.objectPosition || '', '')
})

test('Case 02 applies a loaded Sanity poster hotspot without autoplay', () => {
  const fixture = createCase02Fixture()
  let preload
  class FakeImage {
    constructor() {
      preload = this
      this.listeners = new Map()
    }
    addEventListener(name, listener) {
      this.listeners.set(name, listener)
    }
    set src(value) {
      this.source = value
    }
    dispatch(name) {
      this.listeners.get(name)?.()
    }
  }
  const poster = {
    src: 'https://cdn.sanity.io/images/project/production/poster.jpg',
    width: 1600,
    height: 900,
    objectPosition: '70% 35%',
    alt: {en: 'CMS poster', zh: 'CMS 海报'},
  }

  assert.equal(applyCaseVideo({video: {poster}}, fixture.root, {ImageCtor: FakeImage}), true)
  preload.dispatch('load')
  assert.equal(fixture.video.getAttribute('poster'), poster.src)
  assert.equal(fixture.video.style.objectPosition, '70% 35%')
  assert.equal(fixture.loads(), 0)
  assert.equal(fixture.pauses(), 1)
})

test('Case 02 uses a canonical uploaded MP4 before an external URL without autoplay', () => {
  const fixture = createCase02Fixture()
  fixture.video.play = () => assert.fail('CMS video activation must not autoplay')

  assert.equal(applyCaseVideo({video: {
    fileUrl: 'https://cdn.sanity.io/files/v54qppoy/production/film.mp4',
    externalUrl: 'https://video.example.com/other.mp4',
  }}, fixture.root), true)
  assert.equal(fixture.video.getAttribute('src'), 'https://cdn.sanity.io/files/v54qppoy/production/film.mp4')
  assert.equal(fixture.stage.dataset.videoState, 'ready')
  assert.equal(fixture.video.getAttribute('aria-disabled'), null)
  assert.equal(fixture.video.getAttribute('controls'), '')
  assert.equal(fixture.loads(), 1)
})

test('Case 02 rejects unsafe video URLs without DOM writes', () => {
  const unsafeUrls = [
    'javascript:alert(1)', 'data:video/mp4;base64,AA==', 'blob:https://example.com/film',
    'http://video.example.com/film.mp4', 'https://user:pass@video.example.com/film.mp4',
    'https://video.example.com/film.mp4#fragment', '/assets/videos/../private.mp4',
    '/assets/images/case-02.mp4', 'https://cdn.sanity.io/files/other/production/film.mp4',
    'https://cdn.sanity.io/files/v54qppoy/production/film.mp4\u0000',
  ]
  for (const url of unsafeUrls) {
    const fixture = createCase02Fixture()
    const before = JSON.stringify({stage: fixture.stage.dataset, video: [...fixture.video.attributes]})
    assert.equal(applyCaseVideo({video: {fileUrl: url}}, fixture.root), false, url)
    assert.equal(JSON.stringify({stage: fixture.stage.dataset, video: [...fixture.video.attributes]}), before, url)
  }
})

test('Case 02 replaces a safe CMS poster with localized alt text and clears local responsive attributes', () => {
  const fixture = createCase02Fixture()
  fixture.video.setAttribute('poster', '/assets/images/static-poster.jpg')
  fixture.video.setAttribute('srcset', '/assets/images/static-640.jpg 640w')
  fixture.video.setAttribute('sizes', '100vw')

  assert.equal(applyCaseVideo({video: {
    poster: {src: '/assets/images/case-02-poster.jpg', alt: {en: 'Poster EN', zh: '海报'}} ,
    externalUrl: 'https://video.example.com/film.mp4',
  }}, fixture.root), true)
  assert.equal(fixture.video.getAttribute('poster'), '/assets/images/case-02-poster.jpg')
  assert.equal(fixture.video.getAttribute('data-en-alt'), 'Poster EN')
  assert.equal(fixture.video.getAttribute('data-zh-alt'), '海报')
  assert.equal(fixture.video.getAttribute('srcset'), null)
  assert.equal(fixture.video.getAttribute('sizes'), null)
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

test('detail SEO updates safe editable metadata while preserving the canonical URL', () => {
  const fixture = createFixture()
  const meta = {
    'meta[name="description"]': new FakeElement('meta'),
    'link[rel="canonical"]': new FakeElement('link'),
    'meta[property="og:title"]': new FakeElement('meta'),
    'meta[property="og:description"]': new FakeElement('meta'),
    'meta[property="og:image"]': new FakeElement('meta'),
    'meta[name="twitter:title"]': new FakeElement('meta'),
    'meta[name="twitter:description"]': new FakeElement('meta'),
    'meta[name="twitter:image"]': new FakeElement('meta'),
  }
  for (const node of Object.values(meta)) node.setAttribute('content', 'STATIC')
  meta['link[rel="canonical"]'].removeAttribute('content')
  meta['link[rel="canonical"]'].setAttribute('href', 'https://jagger-sage.vercel.app/pages/cases/case-01')
  const seoDocument = {
    ...document,
    title: 'STATIC TITLE',
    querySelector: (selector) => meta[selector] ?? null,
  }

  assert.equal(applyDetailCase({...record, seo: {
    title: {en: 'CMS PAGE TITLE', zh: 'CMS 页面标题'},
    description: {en: 'CMS DESCRIPTION', zh: 'CMS 页面描述'},
    socialImage: {
      src: 'https://cdn.sanity.io/images/project/production/social.jpg',
      width: 1600,
      height: 900,
      alt: {en: '', zh: ''},
    },
  }}, fixture.root, seoDocument), true)

  assert.equal(seoDocument.title, 'CMS PAGE TITLE')
  assert.equal(meta['meta[name="description"]'].getAttribute('content'), 'CMS DESCRIPTION')
  assert.equal(meta['meta[property="og:title"]'].getAttribute('content'), 'CMS PAGE TITLE')
  assert.equal(meta['meta[property="og:description"]'].getAttribute('content'), 'CMS DESCRIPTION')
  assert.equal(meta['meta[property="og:image"]'].getAttribute('content'), 'https://cdn.sanity.io/images/project/production/social.jpg')
  assert.equal(meta['meta[name="twitter:title"]'].getAttribute('content'), 'CMS PAGE TITLE')
  assert.equal(meta['meta[name="twitter:description"]'].getAttribute('content'), 'CMS DESCRIPTION')
  assert.equal(meta['meta[name="twitter:image"]'].getAttribute('content'), 'https://cdn.sanity.io/images/project/production/social.jpg')
  assert.equal(meta['link[rel="canonical"]'].getAttribute('href'), 'https://jagger-sage.vercel.app/pages/cases/case-01')
})

test('detail SEO uses the current Chinese language when the page is switched before hydration', () => {
  const fixture = createFixture()
  const description = new FakeElement('meta')
  const titleNode = new FakeElement('title')
  const seoDocument = {
    ...document,
    body: {dataset: {lang: 'zh'}},
    title: 'STATIC TITLE',
    querySelector(selector) {
      if (selector === 'title') return titleNode
      if (selector === 'meta[name="description"]') return description
      return null
    },
  }

  assert.equal(applyDetailCase({...record, seo: {
    title: {en: 'ENGLISH TITLE', zh: '中文标题'},
    description: {en: 'English description', zh: '中文描述'},
    socialImage: null,
  }}, fixture.root, seoDocument), true)
  assert.equal(seoDocument.title, '中文标题')
  assert.equal(titleNode.dataset.en, 'ENGLISH TITLE')
  assert.equal(titleNode.dataset.zh, '中文标题')
  assert.equal(description.getAttribute('content'), '中文描述')
  assert.equal(description.dataset.enContent, 'English description')
  assert.equal(description.dataset.zhContent, '中文描述')
})

test('missing or invalid detail SEO values preserve every static metadata value', () => {
  for (const seo of [null, {
    title: {en: '', zh: ''},
    description: {en: '', zh: ''},
    socialImage: {src: 'javascript:alert(1)', alt: {en: '', zh: ''}},
  }]) {
    const fixture = createFixture()
    const description = new FakeElement('meta')
    const social = new FakeElement('meta')
    description.setAttribute('content', 'STATIC DESCRIPTION')
    social.setAttribute('content', 'https://jagger-sage.vercel.app/static.jpg')
    const seoDocument = {
      ...document,
      title: 'STATIC TITLE',
      querySelector(selector) {
        if (selector === 'meta[name="description"]') return description
        if (selector === 'meta[property="og:image"]' || selector === 'meta[name="twitter:image"]') return social
        return null
      },
    }

    assert.equal(applyDetailCase({...record, seo}, fixture.root, seoDocument), true)
    assert.equal(seoDocument.title, 'STATIC TITLE')
    assert.equal(description.getAttribute('content'), 'STATIC DESCRIPTION')
    assert.equal(social.getAttribute('content'), 'https://jagger-sage.vercel.app/static.jpg')
  }
})

test('CMS order controls safe bilingual previous and next Case links', () => {
  const fixture = createFixture()
  const collection = [
    {...record, slug: 'case-01', order: 10},
    {...record, slug: 'case-02', order: 20},
    {...record, slug: 'case-03', order: 30},
  ]

  assert.equal(applyDetailCase(collection[0], fixture.root, document, collection), true)
  assert.equal(fixture.previous.getAttribute('href'), './case-03.html')
  assert.deepEqual(fixture.previous.dataset, {en: '← CASE 03', zh: '← 上一案例 03'})
  assert.equal(fixture.previous.textContent, '← CASE 03')
  assert.equal(fixture.next.getAttribute('href'), './case-02.html')
  assert.deepEqual(fixture.next.dataset, {en: 'CASE 02 →', zh: '下一案例 02 →'})
  assert.equal(fixture.next.textContent, 'CASE 02 →')
})

test('invalid pagination slugs never replace known static local links', () => {
  const fixture = createFixture()
  const before = JSON.stringify({
    previous: {attributes: [...fixture.previous.attributes], dataset: fixture.previous.dataset, text: fixture.previous.textContent},
    next: {attributes: [...fixture.next.attributes], dataset: fixture.next.dataset, text: fixture.next.textContent},
  })

  assert.equal(applyDetailCase(record, fixture.root, document, [
    record,
    {...record, slug: '../contact', order: 2},
  ]), true)
  assert.equal(JSON.stringify({
    previous: {attributes: [...fixture.previous.attributes], dataset: fixture.previous.dataset, text: fixture.previous.textContent},
    next: {attributes: [...fixture.next.attributes], dataset: fixture.next.dataset, text: fixture.next.textContent},
  }), before)
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

test('detail loader selects the current slug and derives pagination from CMS order', async () => {
  const fixture = createFixture()
  const collection = [
    {...record, slug: 'case-03', order: 30, title: {en: 'CASE THREE', zh: '案例三'}},
    {...record, slug: 'case-01', order: 10, title: {en: 'CASE ONE', zh: '案例一'}},
    {...record, slug: 'case-02', order: 20, title: {en: 'CASE TWO', zh: '案例二'}},
  ]

  assert.equal(await loadDetailCase({
    root: fixture.root,
    document,
    fetchCases: async () => collection,
    eventTarget: {dispatchEvent: () => {}},
    warn: () => {},
  }), true)
  assert.equal(fixture.slots['[data-cms="title"]'].textContent, 'CASE ONE')
  assert.equal(fixture.previous.getAttribute('href'), './case-03.html')
  assert.equal(fixture.next.getAttribute('href'), './case-02.html')
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
