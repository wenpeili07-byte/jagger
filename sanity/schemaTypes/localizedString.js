import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  options: {columns: 2},
  fields: [
    defineField({name: 'en', title: 'English', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'zh', title: 'Chinese', type: 'string'}),
  ],
})
