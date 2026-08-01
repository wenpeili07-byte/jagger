import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCaseQueryUrl,
  fetchPublishedCases,
  isSafeMediaUrl,
  normalizeCaseRecord,
  normalizeLocalized,
} from './sanity-case-data.js'

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
