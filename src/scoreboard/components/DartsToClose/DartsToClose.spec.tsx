import { render } from '@testing-library/react';
import { DartsToClose, DartsToCloseProps } from './DartsToClose.component';

describe('DartsToClose', () => {
  const DEFAULT_PROPS: DartsToCloseProps = {
    remaining: 130,
  };

  const renderComponent = (props: Partial<DartsToCloseProps>) => {
    return render(<DartsToClose {...DEFAULT_PROPS} {...props} />);
  };

  test('renders', () => {
    renderComponent({});
  });
});
