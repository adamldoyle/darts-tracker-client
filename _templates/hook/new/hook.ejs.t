---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>hooks/<%= name %>/<%= name %>.hook.ts
---
export interface I<%= Name %> {}

export const <%= name %> = (): I<%= Name %> => {
  return {};
}
