---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>/<%= Name %>.spec.tsx
---
import { render } from '@testing-library/react';
import { <%= Name %>, <%= Name %>Props } from './<%= Name %>.component';

describe('<%= Name %>', () => {
  const DEFAULT_PROPS: <%= Name %>Props = {};

  const renderComponent = (props: Partial<<%= Name %>Props>) => {
    return render(<<%= Name %> {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
