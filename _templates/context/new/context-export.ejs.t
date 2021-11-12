---
inject: true
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>contexts/index.ts
prepend: true
---
export * from './<%= Name %>';