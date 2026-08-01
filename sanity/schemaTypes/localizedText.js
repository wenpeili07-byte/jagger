import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  options: {columns: 2},
  fields: [
    defineField({name: 'en', title: 'English', type: 'text', rows: 4, validation: (Rule) => Rule.required()}),
    defineField({name: 'zh', title: 'Chinese', type: 'text', rows: 4}),
  ],
})
