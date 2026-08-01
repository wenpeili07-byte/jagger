import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {caseDetails} from './detail-pages-data.mjs'
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
    assert.equal(record.slug.current, `case-0${index + 1}`)
    assert.equal(record.order, index + 1)
    assert.equal(record.featured, false)
    assert.deepEqual(Object.keys(record.vehicle), ['make', 'model', 'year', 'chassis', 'specification'])
    assert.deepEqual(record.title, caseDetails[index].title)
    assert.deepEqual(record.subtitle, caseDetails[index].subtitle)
    assert.deepEqual(record.lede, caseDetails[index].intro)
    assert.deepEqual(record.story, caseDetails[index].story)
    assert.ok(record.title.en && record.title.zh)
    assert.ok(record.subtitle.en && record.subtitle.zh)
    assert.ok(record.lede.en && record.lede.zh)
    assert.ok(record.story.en && record.story.zh)
    assert.match(record.cover.imagePath, /^\/assets\/images\/网页\/optimized\/case-0[1-6]\.jpg$/)
    assert.equal(record.seo.title.en, `Case 0${index + 1} | LONMA DYNAMIC`)
    assert.equal(record.seo.description.en, caseDetails[index].meta)
    assert.equal(record.seo.socialImage.imagePath, record.cover.imagePath)
  }
})

test('Case 02 is the only seeded vehicle and photo story', () => {
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
  assert.deepEqual(case02.mediaSections, [
    {
      _key: 'case-02-direction',
      layout: 'textLeft',
      heading: {en: 'THE DIRECTION', zh: '改装方向'},
      body: {
        en: 'Sharper response without turning the car into a single-purpose machine. Braking, chassis feedback, and wheel fitment are considered as one system.',
        zh: '提升响应，同时保留车辆在真实道路中的完整性。刹车、底盘反馈与轮毂数据作为一个系统共同调整。',
      },
      image: {
        imagePath: '/assets/images/shop/brake-kit.webp',
        alt: {en: 'Category reference image: brake system', zh: '分类参考图片：刹车系统'},
      },
    },
    {
      _key: 'case-02-test-adjust-repeat',
      layout: 'textRight',
      heading: {en: 'TEST, ADJUST, REPEAT', zh: '测试、调整、再测试'},
      body: {
        en: 'Each change is judged through real driving, tire condition, and driver feedback. The setup evolves until the car responds as one complete package.',
        zh: '每一次变化都通过真实驾驶、轮胎状态与驾驶反馈判断。持续调整，直到整车形成统一响应。',
      },
      image: {
        imagePath: '/assets/images/shop/coilover-kit.webp',
        alt: {en: 'Category reference image: chassis setup', zh: '分类参考图片：底盘设定'},
      },
    },
    {
      _key: 'case-02-forged-wheel',
      layout: 'full',
      image: {
        imagePath: '/assets/images/shop/forged-wheel.webp',
        alt: {en: 'Category reference image: forged wheel', zh: '分类参考图片：锻造轮毂'},
      },
    },
  ])
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
