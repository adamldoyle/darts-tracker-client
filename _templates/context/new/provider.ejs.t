---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>Provider/<%= Name %>Provider.component.tsx
---
import { FC } from 'react';
import { <%= Name %> } from '../../contexts';

export interface <%= Name %>ProviderProps {}

export const <%= Name %>Provider: FC<<%= Name %>ProviderProps> = ({ children }) => {
  return <<%= Name %>.Provider value={{}}>{children}</<%= Name %>.Provider>;
};
