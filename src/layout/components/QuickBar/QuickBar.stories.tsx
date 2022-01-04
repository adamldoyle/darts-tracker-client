import { Story, Meta } from '@storybook/react';
import { QuickBar, QuickBarProps } from './QuickBar.component';

export default {
  title: 'components/QuickBar',
  component: QuickBar,
} as Meta;

const Template: Story<QuickBarProps> = (args) => <QuickBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  arg: 'QuickBar',
};
