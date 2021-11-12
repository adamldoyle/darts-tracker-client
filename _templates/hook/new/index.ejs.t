---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>hooks/<%= name %>/index.ts
---
export * from './<%= name %>.hook';
