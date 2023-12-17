import { render } from '@testing-library/react';
import { AverageRoundsHistoryPage, AverageRoundsHistoryPageProps } from './AverageRoundsHistoryPage.component';

describe('AverageRoundsHistoryPage', () => {
  const DEFAULT_PROPS: AverageRoundsHistoryPageProps = {};

  const renderComponent = (props: Partial<AverageRoundsHistoryPageProps>) => {
    return render(<AverageRoundsHistoryPage {...DEFAULT_PROPS} {...props} />);
  };

  test('renders', () => {
    renderComponent({});
  });
});
