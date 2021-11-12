---
inject: true
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/index.ts
prepend: true
---
export * from './<%= Name %>Provider';