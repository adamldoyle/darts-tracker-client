---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>/<%= Name %>.component.tsx
---
import { FC } from 'react';

export interface <%= Name %>Props {}

export const <%= Name %>: FC<<%= Name %>Props> = () => {
  return null;
};
