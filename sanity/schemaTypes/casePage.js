import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'casePage',
  title: 'Case Page',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'vehicle', title: 'Vehicle'},
    {name: 'media', title: 'Media'},
    {name: 'seo', title: 'SEO'},
    {name: 'publishing', title: 'Publishing'},
  ],
  fields: [
    defineField({name: 'caseNumber', title: 'Case Number', type: 'string', validation: (Rule) => Rule.required(), group: 'overview'}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'caseNumber'},
      validation: (Rule) => Rule.required().custom(async (value, context) => {
        if (!value?.current) return true

        const id = context.document?._id?.replace(/^drafts\./, '')
        const count = await context.getClient({apiVersion: '2026-08-01'}).fetch(
          'count(*[_type == "casePage" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])',
          {slug: value.current, id},
        )

        return count === 0 || 'Slug must be unique'
      }),
      group: 'publishing',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1).max(36).custom(async (value, context) => {
        if (!Number.isInteger(value)) return true

        const id = context.document?._id?.replace(/^drafts\./, '')
        const count = await context.getClient({apiVersion: '2026-08-01'}).fetch(
          'count(*[_type == "casePage" && order == $order && !(_id in [$id, "drafts." + $id])])',
          {order: value, id},
        )

        return count === 0 || 'Display order must be unique'
      }),
      group: 'publishing',
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: {
        list: [
          {title: 'BMW', value: 'bmw'},
          {title: 'Audi', value: 'audi'},
          {title: 'Mercedes-Benz', value: 'mercedes-benz'},
        ],
      },
      validation: (Rule) => Rule.required(),
      group: 'vehicle',
    }),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false, group: 'publishing'}),
    defineField({
      name: 'vehicle',
      title: 'Vehicle',
      type: 'object',
      fields: [
        defineField({name: 'make', title: 'Make', type: 'string'}),
        defineField({name: 'model', title: 'Model', type: 'string'}),
        defineField({name: 'year', title: 'Year', type: 'string'}),
        defineField({name: 'chassis', title: 'Chassis', type: 'string'}),
        defineField({name: 'specification', title: 'Specification', type: 'string'}),
      ],
      group: 'vehicle',
    }),
    defineField({name: 'title', title: 'Title', type: 'localizedString', validation: (Rule) => Rule.required(), group: 'overview'}),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'localizedString', group: 'overview'}),
    defineField({name: 'lede', title: 'Hero Description', type: 'localizedText', group: 'overview'}),
    defineField({name: 'story', title: 'Opening Narrative', type: 'localizedText', group: 'overview'}),
    defineField({
      name: 'cover',
      title: 'Cover Image',
      type: 'caseImage',
      validation: (Rule) => Rule.required().custom((value) => {
        const hasUpload = Boolean(value?.asset?.asset?._ref)
        const hasPath = Boolean(value?.imagePath?.trim())
        return hasUpload !== hasPath || 'Provide exactly one cover source: an uploaded image or an existing site image path'
      }),
      group: 'media',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'object',
      fields: [
        defineField({name: 'poster', title: 'Poster Image', type: 'caseImage'}),
        defineField({name: 'file', title: 'Upload MP4', type: 'file', options: {accept: 'video/mp4'}}),
        defineField({
          name: 'externalUrl',
          title: 'External MP4 URL',
          type: 'url',
          validation: (Rule) => Rule.uri({scheme: ['https'], allowRelative: false}),
        }),
      ],
      group: 'media',
    }),
    defineField({
      name: 'mediaSections',
      title: 'Media Sections',
      type: 'array',
      of: [defineArrayMember({type: 'mediaSection'})],
      group: 'media',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({name: 'title', title: 'Page Title', type: 'localizedString'}),
        defineField({name: 'description', title: 'Description', type: 'localizedText'}),
        defineField({name: 'socialImage', title: 'Social Image', type: 'caseImage'}),
      ],
      group: 'seo',
    }),
  ],
  preview: {
    select: {caseNumber: 'caseNumber', title: 'title.en', brand: 'brand', media: 'cover.asset'},
    prepare({caseNumber, title, brand, media}) {
      return {title: caseNumber ? `${caseNumber} - ${title || ''}` : title, subtitle: brand, media}
    },
  },
})
