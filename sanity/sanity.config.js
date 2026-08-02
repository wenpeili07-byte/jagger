import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index.js'
import {caseStructure} from './structure.js'

const env = import.meta.env || {}

export default defineConfig({
  name: 'lonma-dynamic',
  title: 'LONMA DYNAMIC Studio',
  projectId: env.SANITY_STUDIO_PROJECT_ID || 'v54qppoy',
  dataset: env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2026-08-01',
  plugins: [
    structureTool({structure: caseStructure}),
    visionTool({defaultApiVersion: '2026-08-01'}),
  ],
  schema: {
    types: schemaTypes,
  },
})
