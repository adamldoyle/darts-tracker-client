import { render } from '@testing-library/react';
import { DartboardWrapper, DartboardWrapperProps } from './DartboardWrapper.component';

describe('Scoreboard', () => {
  const DEFAULT_PROPS: DartboardWrapperProps = {
    size: 40,
    onClick: jest.fn(),
  };

  const renderComponent = (props: Partial<DartboardWrapperProps>) => {
    return render(<DartboardWrapper {...DEFAULT_PROPS} {...props} />);
  };

  test('renders', () => {
    renderComponent({});
  });
});
