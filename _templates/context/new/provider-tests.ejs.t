---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>Provider/<%= Name %>Provider.spec.tsx
---
import { render } from '@testing-library/react';
import { <%= Name %>, I<%= Name %> } from '../../contexts';
import { <%= Name %>Provider, <%= Name %>ProviderProps } from './<%= Name %>Provider.component';

describe('<%= Name %>Provider', () => {
  const DEFAULT_CONTEXT: I<%= Name %> = {};

  const renderComponent = (props: Partial<<%= Name %>ProviderProps>) => {
    const wrapper: Partial<{ context?: I<%= Name %> }> = {};
    render(
      <<%= Name %>Provider {...DEFAULT_CONTEXT} {...props}>
        <<%= Name %>.Consumer>
          {(context) => {
            wrapper.context = context;
            return null;
          }}
        </<%= Name %>.Consumer>
      </<%= Name %>Provider>
    );
    return wrapper;
  };

  test('', () => {
    const { context } = renderComponent({});
    expect(context).toBeDefined();
  });
});
