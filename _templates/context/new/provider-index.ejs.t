---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>Provider/index.ts
---
export * from './<%= Name %>Provider.component';
