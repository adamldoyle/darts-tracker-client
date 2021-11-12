---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>contexts/<%= Name %>/index.ts
---
export * from './<%= Name %>.context';
