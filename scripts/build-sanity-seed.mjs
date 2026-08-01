import {mkdir, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {caseDetails} from '../detail-pages-data.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const brands = ['bmw', 'bmw', 'mercedes-benz', 'bmw', 'audi', 'bmw']
const emptyVehicle = {make: '', model: '', year: '', chassis: '', specification: ''}

const case02MediaSections = [
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
]

export function buildSanitySeed() {
  return caseDetails.map((detail, index) => {
    const number = index + 1
    const slug = `case-${detail.id}`
    const coverPath = `/${detail.image}`

    return {
      _id: `casePage-${slug}`,
      _type: 'casePage',
      caseNumber: `CASE ${detail.id}`,
      slug: {current: slug},
      order: number,
      brand: brands[index],
      featured: false,
      vehicle: detail.id === '02'
        ? {make: 'BMW', model: 'G80 M3', year: '2024', chassis: 'G8X', specification: ''}
        : {...emptyVehicle},
      title: detail.title,
      subtitle: detail.subtitle,
      lede: detail.intro,
      story: detail.story,
      cover: {imagePath: coverPath},
      mediaSections: detail.id === '02' ? case02MediaSections : [],
      seo: {
        title: {en: `Case ${detail.id} | LONMA DYNAMIC`},
        description: {en: detail.meta},
        socialImage: {imagePath: coverPath},
      },
    }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const seedDirectory = resolve(root, 'sanity/seed')
  const lines = buildSanitySeed().map((record) => JSON.stringify(record)).join('\n') + '\n'

  await mkdir(seedDirectory, {recursive: true})
  await writeFile(resolve(seedDirectory, 'case-pages.ndjson'), lines)
}
