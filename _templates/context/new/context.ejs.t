---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>contexts/<%= Name %>/<%= Name %>.context.tsx
---
import { createContext } from 'react';

export interface I<%= Name %> {}

export const <%= Name %> = createContext<I<%= Name %> | undefined>(undefined);
<%= Name %>.displayName = '<%= Name %>';
