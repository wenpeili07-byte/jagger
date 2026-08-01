import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'caseImage',
  title: 'Case Image',
  type: 'object',
  fields: [
    defineField({name: 'asset', title: 'Upload Image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'imagePath',
      title: 'Existing Site Image Path',
      type: 'string',
      validation: (Rule) => Rule.custom((value) => !value || value.startsWith('/assets/images/') || 'Use an /assets/images/ path'),
    }),
    defineField({name: 'alt', title: 'Alt Text', type: 'localizedString'}),
  ],
})
