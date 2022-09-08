import { render } from '@testing-library/react';
import { EloHistoryPage, EloHistoryPageProps } from './EloHistoryPage.component';

describe('EloHistoryPage', () => {
  const DEFAULT_PROPS: EloHistoryPageProps = {};

  const renderComponent = (props: Partial<EloHistoryPageProps>) => {
    return render(<EloHistoryPage {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
