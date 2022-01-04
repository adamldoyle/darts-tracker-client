import { render, screen } from '@testing-library/react';
import { QuickBar } from './QuickBar.component';

describe('QuickBar', () => {
  it('renders', () => {
    render(<QuickBar arg="testArg" />);
    expect(screen.getByText('testArg'));
  });
});
