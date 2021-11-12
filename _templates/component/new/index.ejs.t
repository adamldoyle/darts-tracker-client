---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>/index.ts
---
export * from './<%= Name %>.component';
