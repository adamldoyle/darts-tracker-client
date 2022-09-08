import { render } from '@testing-library/react';
import { LandingPage, LandingPageProps } from './LandingPage.component';

describe('LandingPage', () => {
  const DEFAULT_PROPS: LandingPageProps = {};

  const renderComponent = (props: Partial<LandingPageProps>) => {
    return render(<LandingPage {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
