import { render } from '@testing-library/react';
import { CreateGamePage, CreateGamePageProps } from './CreateGamePage.component';

describe('CreateGamePage', () => {
  const DEFAULT_PROPS: CreateGamePageProps = {};

  const renderComponent = (props: Partial<CreateGamePageProps>) => {
    return render(<CreateGamePage {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
