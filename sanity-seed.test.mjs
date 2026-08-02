import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {caseDetails} from './detail-pages-data.mjs'
import {normalizeCaseRecord} from './sanity-case-data.js'
import {buildSanitySeed} from './scripts/build-sanity-seed.mjs'

test('seed contains six deterministic schema-shaped bilingual Case documents', () => {
  const records = buildSanitySeed()

  assert.equal(records.length, 6)
  assert.deepEqual(records.map((record) => record._id), [
    'casePage-case-01', 'casePage-case-02', 'casePage-case-03',
    'casePage-case-04', 'casePage-case-05', 'casePage-case-06',
  ])
  assert.deepEqual(records.map((record) => record.brand), [
    'bmw', 'bmw', 'mercedes-benz', 'bmw', 'audi', 'bmw',
  ])

  for (const [index, record] of records.entries()) {
    assert.equal(record._type, 'casePage')
    assert.equal(record._id.startsWith('drafts.'), false)
    assert.equal(record.caseNumber, `CASE 0${index + 1}`)
    assert.equal(record.slug._type, 'slug')
    assert.equal(record.slug.current, `case-0${index + 1}`)
    assert.equal(record.order, index + 1)
    assert.equal(record.featured, false)
    assert.deepEqual(Object.keys(record.vehicle), ['make', 'model', 'year', 'chassis', 'specification'])
    assert.deepEqual({en: record.title.en, zh: record.title.zh}, caseDetails[index].title)
    assert.deepEqual({en: record.subtitle.en, zh: record.subtitle.zh}, caseDetails[index].subtitle)
    assert.deepEqual({en: record.lede.en, zh: record.lede.zh}, caseDetails[index].intro)
    assert.deepEqual({en: record.story.en, zh: record.story.zh}, caseDetails[index].story)
    assert.equal(record.title._type, 'localizedString')
    assert.equal(record.subtitle._type, 'localizedString')
    assert.equal(record.lede._type, 'localizedText')
    assert.equal(record.story._type, 'localizedText')
    assert.ok(record.title.en && record.title.zh)
    assert.ok(record.subtitle.en && record.subtitle.zh)
    assert.ok(record.lede.en && record.lede.zh)
    assert.ok(record.story.en && record.story.zh)
    assert.match(record.cover.imagePath, /^\/assets\/images\/网页\/optimized\/case-0[1-6]\.jpg$/)
    assert.equal(record.cover._type, 'caseImage')
    assert.deepEqual(record.cover.alt, {
      _type: 'localizedString',
      en: `LONMA DYNAMIC ${caseDetails[index].title.en}`,
      zh: `LONMA DYNAMIC ${caseDetails[index].title.zh}`,
    })
    assert.equal(record.seo.title._type, 'localizedString')
    assert.equal(record.seo.description._type, 'localizedText')
    assert.equal(record.seo.title.en, `Case 0${index + 1} | LONMA DYNAMIC`)
    assert.equal(record.seo.description.en, caseDetails[index].meta)
    assert.equal(record.seo.socialImage.imagePath, record.cover.imagePath)
    assert.equal(record.seo.socialImage._type, 'caseImage')
    assert.deepEqual(record.seo.socialImage.alt, record.cover.alt)
    const normalized = normalizeCaseRecord({...record, slug: record.slug.current})
    assert.deepEqual(normalized?.cover.alt, {
      en: `LONMA DYNAMIC ${caseDetails[index].title.en}`,
      zh: `LONMA DYNAMIC ${caseDetails[index].title.zh}`,
    })
  }
})

test('Case 02 is the only seeded vehicle and typed photo story', () => {
  const records = buildSanitySeed()
  const [case01, case02, ...remainingCases] = records

  assert.deepEqual(case01.vehicle, {make: '', model: '', year: '', chassis: '', specification: ''})
  assert.deepEqual(case02.vehicle, {
    make: 'BMW', model: 'G80 M3', year: '2024', chassis: 'G8X', specification: '',
  })
  assert.deepEqual(remainingCases.map((record) => record.vehicle), Array(4).fill({
    make: '', model: '', year: '', chassis: '', specification: '',
  }))
  assert.deepEqual(case01.mediaSections, [])
  assert.deepEqual(remainingCases.map((record) => record.mediaSections), [[], [], [], []])
  assert.deepEqual(case02.mediaSections.map((section) => ({_key: section._key, layout: section.layout})), [
    {_key: 'case-02-direction', layout: 'textLeft'},
    {_key: 'case-02-test-adjust-repeat', layout: 'textRight'},
    {_key: 'case-02-forged-wheel', layout: 'full'},
  ])
  for (const section of case02.mediaSections) {
    assert.equal(section._type, 'mediaSection')
    assert.ok(section._key)
    assert.equal(section.image._type, 'caseImage')
    assert.equal(section.image.alt._type, 'localizedString')
  }
  assert.deepEqual(case02.mediaSections[0].heading, {_type: 'localizedString', en: 'THE DIRECTION', zh: '改装方向'})
  assert.equal(case02.mediaSections[0].body._type, 'localizedText')
  assert.deepEqual(case02.mediaSections[1].heading, {_type: 'localizedString', en: 'TEST, ADJUST, REPEAT', zh: '测试、调整、再测试'})
  assert.equal(case02.mediaSections[1].body._type, 'localizedText')
  assert.equal('heading' in case02.mediaSections[2], false)
  assert.equal('body' in case02.mediaSections[2], false)
})

test('checked-in NDJSON matches the generator with a final newline', () => {
  const source = readFileSync(new URL('./sanity/seed/case-pages.ndjson', import.meta.url), 'utf8')

  assert.equal(source.endsWith('\n'), true)
  assert.deepEqual(source.trim().split('\n').map(JSON.parse), buildSanitySeed())
})

test('importing the generator does not require a command entrypoint', () => {
  assert.doesNotThrow(() => {
    execFileSync(process.execPath, [
      '--input-type=module',
      '--eval',
      "await import('./scripts/build-sanity-seed.mjs')",
    ], {cwd: new URL('.', import.meta.url)})
  })
})
