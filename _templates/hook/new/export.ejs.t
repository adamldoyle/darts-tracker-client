---
inject: true
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>hooks/index.ts
prepend: true
---
export * from './<%= name %>';