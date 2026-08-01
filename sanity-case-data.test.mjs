import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCaseQueryUrl,
  fetchPublishedCases,
  isSafeMediaUrl,
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

test('invalid image cover sources reject the full record', () => {
  assert.equal(normalizeCaseRecord(validCase({cover: {imagePath: '/assets/videos/case-01.mp4'}})), null)
  assert.equal(normalizeCaseRecord(validCase({cover: {asset: {url: 'https://cdn.sanity.io/images/x/y/car.jpg'}}})), null)
})

test('detail query is restricted to a published slug', () => {
  const url = buildCaseQueryUrl('case-01')
  assert.equal(url.hostname, 'v54qppoy.api.sanity.io')
  assert.equal(url.searchParams.get('$slug'), '"case-01"')
  assert.match(url.searchParams.get('query'), /!\(_id in path\("drafts\.\*"\)\)/)
})

test('invalid records never replace static content', () => {
  assert.equal(normalizeCaseRecord({slug: 'case-01'}), null)
})

test('invalid detail slugs are rejected before query construction', () => {
  assert.throws(() => buildCaseQueryUrl('case-01" || defined(_id)'))
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
