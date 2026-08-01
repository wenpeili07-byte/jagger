import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCaseQueryUrl,
  fetchPublishedCases,
  isSafeMediaUrl,
  isSafeCaseVideoUrl,
  buildResponsiveSanityImage,
  normalizeCaseRecord,
  normalizeLocalized,
} from './sanity-case-data.js'

function validCase(overrides = {}) {
  return {
    slug: 'case-01',
    order: 1,
    brand: 'bmw',
    title: {en: 'STREET WIDEBODY'},
    cover: {imagePath: '/assets/images/网页/optimized/case-01.jpg'},
    ...overrides,
  }
}

test('Chinese copy falls back to English', () => {
  assert.deepEqual(normalizeLocalized({en: 'STREET WIDEBODY', zh: ''}), {
    en: 'STREET WIDEBODY',
    zh: 'STREET WIDEBODY',
  })
})

test('unsafe media schemes are rejected', () => {
  assert.equal(isSafeMediaUrl('javascript:alert(1)'), false)
  assert.equal(isSafeMediaUrl('http://example.com/car.jpg'), false)
  assert.equal(isSafeMediaUrl('https://cdn.sanity.io/car.jpg'), true)
  assert.equal(isSafeMediaUrl('/assets/images/网页/optimized/case-01.jpg'), true)
})

test('Case 02 video URLs allow only canonical direct MP4 assets', () => {
  for (const value of [
    '/assets/videos/case-02.mp4', '/assets/videos/film/CASE-02.MP4',
    'https://video.example.com/film.mp4', 'https://video.example.com/film/CASE-02.MP4',
    'https://cdn.sanity.io/files/v54qppoy/production/film.mp4',
    'https://cdn.sanity.io/files/v54qppoy/production/CASE-02.MP4',
  ]) assert.equal(isSafeCaseVideoUrl(value), true, value)

  for (const value of [
    '/assets/images/case-02.mp4', '/assets/videos/cover.jpg', '/assets/videos/film.html',
    '/assets/videos/film.mp4.exe', '/assets/videos/film', '/assets/videos/../private.mp4',
    '/assets/videos//film.mp4', '/assets/videos\\film.mp4', '/assets/videos/%66ilm.mp4',
    'javascript:alert(1)',
    'data:video/mp4;base64,AA==', 'blob:https://video.example.com/film', 'http://video.example.com/film.mp4',
    '//video.example.com/film.mp4', 'https://video.example.com/not-a-video.html',
    'https://video.example.com/film.mp4.exe', 'https://video.example.com/film',
    'https://video.example.com/%66ilm.mp4', 'https://video.example.com/film%2Emp4',
    'https://video.example.com/film%2Fother.mp4', 'https://video.example.com//film.mp4',
    'https://user:pass@video.example.com/film.mp4', 'https://video.example.com/film.mp4#fragment',
    'https://video.example.com/film.mp4?token=secret', 'https://cdn.sanity.io/files/other/production/film.mp4',
    'https://cdn.sanity.io/files/v54qppoy/production/film.jpg',
    'https://cdn.sanity.io/files/v54qppoy/production/film.mp4?download=1',
    'https://cdn.sanity.io/files/v54qppoy/production/film%2Emp4',
    'https://cdn.sanity.io/files/v54qppoy/production/film.mp4\u0000',
    'https://video.example.com/film.mp4\u0085', 'https://video.example.com/fi\u202Elm.mp4',
    'https://video.example.com/fi\u200Blm.mp4', '/assets/videos/fi\uFEFFlm.mp4',
  ]) assert.equal(isSafeCaseVideoUrl(value), false, value)
})

test('encoded local traversal is rejected before asset prefix validation', () => {
  assert.equal(isSafeMediaUrl('/assets/images/%2e%2e%2fprivate-file'), false)
  assert.equal(isSafeMediaUrl('/assets/images/%2E%2E/private-file'), false)
  assert.equal(isSafeMediaUrl('/assets/images/%252e%252e%252fprivate-file'), false)
  assert.equal(isSafeMediaUrl('/assets/images/../private-file'), false)
})

test('image normalization permits only canonical local image paths or dimensioned Sanity CDN assets', () => {
  assert.equal(buildResponsiveSanityImage({imagePath: '/assets/videos/case-01.mp4'}), null)
  assert.equal(buildResponsiveSanityImage({asset: {url: 'https://example.com/car.jpg'}}), null)
  assert.equal(buildResponsiveSanityImage({asset: {url: 'https://cdn.sanity.io/images/x/y/car.jpg'}}), null)
  assert.deepEqual(
    buildResponsiveSanityImage({
      asset: {url: 'https://cdn.sanity.io/images/x/y/car.jpg', metadata: {dimensions: {width: 1600, height: 900}}},
    }),
    {
      src: 'https://cdn.sanity.io/images/x/y/car.jpg',
      alt: {en: '', zh: ''},
      width: 1600,
      height: 900,
      srcset: 'https://cdn.sanity.io/images/x/y/car.jpg?w=640&auto=format 640w, https://cdn.sanity.io/images/x/y/car.jpg?w=960&auto=format 960w, https://cdn.sanity.io/images/x/y/car.jpg?w=1600&auto=format 1600w',
    },
  )
})

test('Sanity image URLs reject srcset candidate injection, credentials, and fragments', () => {
  const dimensions = {width: 1600, height: 900}
  assert.equal(
    buildResponsiveSanityImage({asset: {url: 'https://cdn.sanity.io/images/x/y/a.jpg,https://evil.example/x.jpg', metadata: {dimensions}}}),
    null,
  )
  assert.equal(
    buildResponsiveSanityImage({asset: {url: 'https://user:password@cdn.sanity.io/images/x/y/a.jpg', metadata: {dimensions}}}),
    null,
  )
  assert.equal(
    buildResponsiveSanityImage({asset: {url: 'https://cdn.sanity.io/images/x/y/a.jpg#fragment', metadata: {dimensions}}}),
    null,
  )
})

test('Sanity image paths reject double-encoded segments and accept canonical production assets', () => {
  const dimensions = {width: 1600, height: 900}
  assert.equal(
    buildResponsiveSanityImage({asset: {url: 'https://cdn.sanity.io/images/v54qppoy/production/%252e%252e.jpg', metadata: {dimensions}}}),
    null,
  )
  assert.equal(
    buildResponsiveSanityImage({asset: {url: 'https://cdn.sanity.io/images/v54qppoy/production/%252f.jpg', metadata: {dimensions}}}),
    null,
  )
  assert.ok(
    buildResponsiveSanityImage({asset: {url: 'https://cdn.sanity.io/images/v54qppoy/production/asset-1600x900-jpg.jpg', metadata: {dimensions}}}),
  )
})

test('invalid image cover sources reject the full record', () => {
  assert.equal(normalizeCaseRecord(validCase({cover: {imagePath: '/assets/videos/case-01.mp4'}})), null)
  assert.equal(normalizeCaseRecord(validCase({cover: {asset: {url: 'https://cdn.sanity.io/images/x/y/car.jpg'}}})), null)
})

test('detail query requests the published collection in CMS order with image editing metadata', () => {
  const url = buildCaseQueryUrl('case-01')
  assert.equal(url.hostname, 'v54qppoy.api.sanity.io')
  assert.equal(url.searchParams.get('$slug'), null)
  assert.match(url.searchParams.get('query'), /!\(_id in path\("drafts\.\*"\)\)/)
  assert.match(url.searchParams.get('query'), /order\(order asc\)/)
  assert.doesNotMatch(url.searchParams.get('query'), /slug\.current == \$slug/)
  assert.match(url.searchParams.get('query'), /"crop":\s*asset\.crop/)
  assert.match(url.searchParams.get('query'), /"hotspot":\s*asset\.hotspot/)
  assert.match(url.searchParams.get('query'), /socialImage\{imagePath, alt,/)
})

test('uploaded images normalize Sanity crop and hotspot into a cropped source and safe object position', () => {
  assert.deepEqual(
    buildResponsiveSanityImage({
      asset: {
        url: 'https://cdn.sanity.io/images/v54qppoy/production/car-2000x1000-jpg.jpg',
        metadata: {dimensions: {width: 2000, height: 1000}},
      },
      crop: {left: 0.1, right: 0.2, top: 0.1, bottom: 0.1},
      hotspot: {x: 0.55, y: 0.45, width: 0.2, height: 0.2},
    }),
    {
      src: 'https://cdn.sanity.io/images/v54qppoy/production/car-2000x1000-jpg.jpg?rect=200%2C100%2C1400%2C800',
      alt: {en: '', zh: ''},
      width: 1400,
      height: 800,
      srcset: 'https://cdn.sanity.io/images/v54qppoy/production/car-2000x1000-jpg.jpg?rect=200%2C100%2C1400%2C800&w=640&auto=format 640w, https://cdn.sanity.io/images/v54qppoy/production/car-2000x1000-jpg.jpg?rect=200%2C100%2C1400%2C800&w=960&auto=format 960w',
      objectPosition: '64.29% 43.75%',
    },
  )
})

test('invalid crop and hotspot values are ignored without affecting a valid uploaded image', () => {
  const image = buildResponsiveSanityImage({
    asset: {
      url: 'https://cdn.sanity.io/images/v54qppoy/production/car-1600x900-jpg.jpg',
      metadata: {dimensions: {width: 1600, height: 900}},
    },
    crop: {left: 0.8, right: 0.4, top: 0, bottom: 0},
    hotspot: {x: 2, y: -1, width: 0.2, height: 0.2},
  })

  assert.equal(image.src, 'https://cdn.sanity.io/images/v54qppoy/production/car-1600x900-jpg.jpg')
  assert.equal(image.width, 1600)
  assert.equal(image.height, 900)
  assert.equal('objectPosition' in image, false)
})

test('invalid records never replace static content', () => {
  assert.equal(normalizeCaseRecord({slug: 'case-01'}), null)
})

test('invalid detail slugs are rejected before query construction', () => {
  for (const slug of ['case-00', 'case-07', 'case-37', '../case-01', 'CASE-01', 'case-01" || defined(_id)']) {
    assert.throws(() => buildCaseQueryUrl(slug), TypeError)
  }
})

test('fetchPublishedCases aborts on timeout and propagates the abort error', async () => {
  let signal
  const abortError = new Error('request aborted')
  abortError.name = 'AbortError'

  await assert.rejects(
    fetchPublishedCases({
      timeoutMs: 1,
      fetchImpl: (_url, options) => {
        signal = options.signal
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(abortError), {once: true})
        })
      },
    }),
    abortError,
  )
  assert.equal(signal.aborted, true)
})

test('fetchPublishedCases clears its timeout after an error', async () => {
  let signal

  await assert.rejects(
    fetchPublishedCases({
      timeoutMs: 10,
      fetchImpl: (_url, options) => {
        signal = options.signal
        return Promise.reject(new Error('network unavailable'))
      },
    }),
    /network unavailable/,
  )

  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(signal.aborted, false)
})

test('fetchPublishedCases rejects the full collection when normalized slugs or orders duplicate', async () => {
  await assert.rejects(
    fetchPublishedCases({
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({result: [validCase(), validCase({order: 2})]}),
      }),
    }),
    /duplicate.*slug/i,
  )

  await assert.rejects(
    fetchPublishedCases({
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({result: [validCase(), validCase({slug: 'case-02', order: 1})]}),
      }),
    }),
    /duplicate.*order/i,
  )
})

test('fetchPublishedCases returns valid records in normalized CMS order', async () => {
  const cases = await fetchPublishedCases({
    slug: 'case-02',
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({result: [
        validCase({slug: 'case-03', order: 3}),
        validCase({slug: 'case-01', order: 1}),
        validCase({slug: 'case-02', order: 2}),
      ]}),
    }),
  })

  assert.deepEqual(cases.map(({slug, order}) => ({slug, order})), [
    {slug: 'case-01', order: 1},
    {slug: 'case-02', order: 2},
    {slug: 'case-03', order: 3},
  ])
})

test('fetchPublishedCases propagates HTTP response errors', async () => {
  await assert.rejects(
    fetchPublishedCases({
      fetchImpl: async () => ({ok: false, status: 503}),
    }),
    /Sanity request failed with 503/,
  )
})

test('fetchPublishedCases propagates invalid JSON errors', async () => {
  const invalidJson = new SyntaxError('Unexpected end of JSON input')

  await assert.rejects(
    fetchPublishedCases({
      fetchImpl: async () => ({
        ok: true,
        json: async () => { throw invalidJson },
      }),
    }),
    invalidJson,
  )
})
