---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>contexts/<%= Name %>/<%= Name %>TestProvider.tsx
---
import { FC } from 'react';
import { <%= Name %>, I<%= Name %> } from './<%= Name %>.context';

const DEFAULT_CONTEXT: I<%= Name %> = {};

export const <%= Name %>TestProvider: FC<Partial<I<%= Name %>>> = ({ children, ...contextOverrides }) => {
  return <<%= Name %>.Provider value={{ ...DEFAULT_CONTEXT, ...contextOverrides }}>{children}</<%= Name %>.Provider>;
};
