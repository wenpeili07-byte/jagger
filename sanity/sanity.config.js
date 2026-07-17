import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index.js'

const env = import.meta.env || {}

export default defineConfig({
  name: 'lonma-dynamic',
  title: 'LONMA DYNAMIC Studio',
  projectId: env.SANITY_STUDIO_PROJECT_ID || 'replace-with-project-id',
  dataset: env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool(),
    visionTool({defaultApiVersion: '2026-07-17'}),
  ],
  schema: {
    types: schemaTypes,
  },
})
