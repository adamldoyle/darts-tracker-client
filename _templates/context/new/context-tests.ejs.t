---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>contexts/<%= Name %>/<%= Name %>.spec.tsx
---
import { render } from '@testing-library/react';
import { <%= Name %> } from './<%= Name %>.context';

describe('<%= Name %>', () => {
  test('provides undefined context when no provider', () => {
    render(
      <<%= Name %>.Consumer>
        {(context) => {
          expect(context).not.toBeDefined();
          return null;
        }}
      </<%= Name %>.Consumer>
    );
  });
});
