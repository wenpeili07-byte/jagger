export default {
  name: 'casePage',
  title: 'Case Page',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caseNumber',
      title: 'Case Number',
      type: 'string',
      initialValue: 'CASE 01',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'shortTitle',
      title: 'Short Chinese Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'lede',
      title: 'Hero Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'meta',
      title: 'Meta Tags',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'video',
      title: 'Video',
      type: 'object',
      fields: [
        {
          name: 'poster',
          title: 'Poster Image',
          type: 'image',
          options: {hotspot: true},
        },
        {
          name: 'src',
          title: 'MP4 Path',
          type: 'string',
          description: 'Keep external or site-local video paths here, such as /assets/videos/case-01.mp4.',
        },
      ],
    },
    {
      name: 'overview',
      title: 'Overview',
      type: 'object',
      fields: [
        {name: 'heading', title: 'Heading', type: 'string'},
        {name: 'body', title: 'Body', type: 'text', rows: 4},
      ],
    },
    {
      name: 'mediaSections',
      title: 'Photo And Text Sections',
      type: 'array',
      of: [
        {
          name: 'mediaSection',
          title: 'Photo And Text Section',
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            },
            {
              name: 'imagePath',
              title: 'Existing Site Image Path',
              type: 'string',
              description: 'Use this while comparing CMS options, for example /assets/images/网页/optimized/case-01.jpg.',
            },
            {name: 'alt', title: 'Image Alt Text', type: 'string'},
            {name: 'heading', title: 'Heading', type: 'string'},
            {name: 'body', title: 'Body', type: 'text', rows: 3},
            {name: 'reversed', title: 'Reverse Layout', type: 'boolean', initialValue: false},
            {name: 'actionText', title: 'Action Text', type: 'string'},
            {name: 'actionHref', title: 'Action Link', type: 'string'},
          ],
          preview: {
            select: {
              title: 'heading',
              subtitle: 'body',
              media: 'image',
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'scope',
      title: 'Build Scope',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'cta',
      title: 'CTA',
      type: 'object',
      fields: [
        {name: 'heading', title: 'Heading', type: 'string'},
        {name: 'buttonText', title: 'Button Text', type: 'string'},
        {name: 'buttonHref', title: 'Button Link', type: 'string'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caseNumber',
      media: 'video.poster',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: subtitle ? `${subtitle} · ${title}` : title,
        media,
      }
    },
  },
}
