---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>hooks/<%= name %>/<%= name %>.spec.tsx
---
import { renderHook as tlRenderHook } from '@testing-library/react-hooks';
import { <%= name %> } from './<%= name %>.hook';

describe('<%= name %>', () => {
  const renderHook = () => {
    return tlRenderHook(() => <%= name %>(), {
      wrapper: ({ children }) => <>{children}</>,
    });
  }

  test('renders', () => {
    const wrapper = renderHook();
    expect(wrapper.result.current).toEqual({});
  });
});
