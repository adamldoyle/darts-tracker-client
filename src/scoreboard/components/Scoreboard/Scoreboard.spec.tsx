import { render } from '@testing-library/react';
import { Scoreboard, ScoreboardProps } from './Scoreboard.component';

describe('Scoreboard', () => {
  const DEFAULT_PROPS: ScoreboardProps = {};

  const renderComponent = (props: Partial<ScoreboardProps>) => {
    return render(<Scoreboard {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
