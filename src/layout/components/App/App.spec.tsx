import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'store/configureStore';
import { App } from './App.component';

describe('App', () => {
  it('renders', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
  });
});
