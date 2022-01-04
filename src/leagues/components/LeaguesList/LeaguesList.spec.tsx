import { render } from '@testing-library/react';
import { LeaguesList, LeaguesListProps } from './LeaguesList.component';

describe('LeaguesList', () => {
  const DEFAULT_PROPS: LeaguesListProps = {};

  const renderComponent = (props: Partial<LeaguesListProps>) => {
    return render(<LeaguesList {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
