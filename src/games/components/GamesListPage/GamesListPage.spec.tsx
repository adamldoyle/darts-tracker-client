import { render } from '@testing-library/react';
import { GamesListPage, GamesListPageProps } from './GamesListPage.component';

describe('GamesListPage', () => {
  const DEFAULT_PROPS: GamesListPageProps = {};

  const renderComponent = (props: Partial<GamesListPageProps>) => {
    return render(<GamesListPage {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
