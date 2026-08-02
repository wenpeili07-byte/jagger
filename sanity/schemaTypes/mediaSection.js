import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'mediaSection',
  title: 'Media Section',
  type: 'object',
  fields: [
    defineField({name: 'image', title: 'Image', type: 'caseImage'}),
    defineField({name: 'heading', title: 'Heading', type: 'localizedString'}),
    defineField({name: 'body', title: 'Body', type: 'localizedText'}),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'full',
      options: {
        layout: 'radio',
        list: [
          {title: 'Full Width', value: 'full'},
          {title: 'Text Left', value: 'textLeft'},
          {title: 'Text Right', value: 'textRight'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'heading.en', subtitle: 'layout', media: 'image.asset'},
  },
})
