import { render } from '@testing-library/react';
import { EditLeagueModal, EditLeagueModalProps } from './EditLeagueModal.component';

describe('EditLeagueModal', () => {
  const DEFAULT_PROPS: EditLeagueModalProps = {};

  const renderComponent = (props: Partial<EditLeagueModalProps>) => {
    return render(<EditLeagueModal {...DEFAULT_PROPS} {...props} />);
  }

  test('renders', () => {
    renderComponent({});
  });
});
