import { render } from '@testing-library/react';
import { App, AppProps } from './App.component';

describe('App', () => {
  const DEFAULT_PROPS: AppProps = {};

  const renderComponent = (props: Partial<AppProps>) => {
    return render(<App {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
