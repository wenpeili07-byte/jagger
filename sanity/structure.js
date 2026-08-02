export const caseStructure = (S) =>
  S.list()
    .title('LONMA DYNAMIC Content')
    .items([
      S.listItem()
        .title('Case Pages')
        .schemaType('casePage')
        .child(S.documentTypeList('casePage').title('Case Pages').order([{field: 'order', direction: 'asc'}])),
    ])
