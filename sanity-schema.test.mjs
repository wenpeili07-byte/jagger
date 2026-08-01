import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'

const schemaPath = new URL('./sanity/schemaTypes/casePage.js', import.meta.url)
const caseImagePath = new URL('./sanity/schemaTypes/caseImage.js', import.meta.url)
const schemaIndexPath = new URL('./sanity/schemaTypes/index.js', import.meta.url)

function createRule() {
  const calls = []
  const rule = {
    required() {
      calls.push({name: 'required'})
      return rule
    },
    integer() {
      calls.push({name: 'integer'})
      return rule
    },
    min(value) {
      calls.push({name: 'min', value})
      return rule
    },
    max(value) {
      calls.push({name: 'max', value})
      return rule
    },
    uri(options) {
      calls.push({name: 'uri', options})
      return rule
    },
    custom(callback) {
      calls.push({name: 'custom', callback})
      return rule
    },
  }

  return {calls, rule}
}

async function loadSchema(url) {
  const source = readFileSync(url, 'utf8').replace(
    /import \{[^}]+\} from 'sanity'/,
    `const defineType = (definition) => definition;
     const defineField = (definition) => definition;
     const defineArrayMember = (definition) => definition;`,
  )
  return (await import(`data:text/javascript,${encodeURIComponent(source)}`)).default
}

async function loadRegistry() {
  const source = readFileSync(schemaIndexPath, 'utf8').replace(
    /import (\w+) from '[^']+'\n/g,
    'const $1 = {name: \'$1\'}\n',
  )
  return (await import(`data:text/javascript,${encodeURIComponent(source)}`)).schemaTypes
}

function findField(definition, name) {
  return definition.fields.find((field) => field.name === name)
}

function customValidator(field) {
  const {calls, rule} = createRule()
  field.validation(rule)
  const custom = calls.find((call) => call.name === 'custom')
  assert.ok(custom, `${field.name} should define custom validation`)
  return custom.callback
}

test('case schema rejects duplicate slug and display order values outside the current document', async () => {
  const casePage = await loadSchema(schemaPath)
  const slugValidator = customValidator(findField(casePage, 'slug'))
  const orderValidator = customValidator(findField(casePage, 'order'))
  const context = {
    document: {_id: 'drafts.casePage-case-02'},
    getClient: () => ({fetch: async (query, params) => {
      assert.match(query, /"drafts\." \+ \$id/)
      assert.equal(params.id, 'casePage-case-02')
      return 1
    }}),
  }

  assert.equal(await slugValidator({current: 'case-01'}, context), 'Slug must be unique')
  assert.equal(await orderValidator(1, context), 'Display order must be unique')
})

test('case schema accepts its own draft and published slug and display order values', async () => {
  const casePage = await loadSchema(schemaPath)
  const slugValidator = customValidator(findField(casePage, 'slug'))
  const orderValidator = customValidator(findField(casePage, 'order'))
  const context = {
    document: {_id: 'drafts.casePage-case-01'},
    getClient: () => ({fetch: async (query, params) => {
      assert.match(query, /"drafts\." \+ \$id/)
      assert.equal(params.id, 'casePage-case-01')
      return 0
    }}),
  }

  assert.equal(await slugValidator({current: 'case-01'}, context), true)
  assert.equal(await orderValidator(1, context), true)
})

test('case schema limits the public collection to Case 01 through Case 06', async () => {
  const casePage = await loadSchema(schemaPath)
  const slugField = findField(casePage, 'slug')
  const orderField = findField(casePage, 'order')
  const slugValidator = customValidator(slugField)
  const {calls, rule} = createRule()
  orderField.validation(rule)

  assert.deepEqual(calls.find((call) => call.name === 'max'), {name: 'max', value: 6})
  assert.equal(
    await slugValidator(
      {current: 'case-07'},
      {getClient: () => ({fetch: async () => assert.fail('invalid slugs must not query Sanity')})},
    ),
    'Slug must be case-01 through case-06',
  )
})

test('case schema requires exactly one usable cover source', async () => {
  const casePage = await loadSchema(schemaPath)
  const coverValidator = customValidator(findField(casePage, 'cover'))

  assert.equal(coverValidator({}), 'Provide exactly one cover source: an uploaded image or an existing site image path')
  assert.equal(coverValidator({asset: {asset: {_ref: 'image-abc'}}, imagePath: '/assets/images/cover.jpg'}), 'Provide exactly one cover source: an uploaded image or an existing site image path')
  assert.equal(coverValidator({asset: {asset: {_ref: 'image-abc'}}}), true)
  assert.equal(coverValidator({imagePath: ' /assets/images/cover.jpg '}), true)
})

test('schema definitions and registry load the complete production type set', async () => {
  const caseImage = await loadSchema(caseImagePath)
  const schemaTypes = await loadRegistry()

  assert.equal(caseImage.name, 'caseImage')
  assert.equal(caseImage.type, 'object')
  assert.deepEqual(schemaTypes.map((schema) => schema.name), [
    'localizedString',
    'localizedText',
    'caseImage',
    'mediaSection',
    'casePage',
  ])
})
