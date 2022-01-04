import { Story, Meta } from '@storybook/react';
import { AppToolbar, AppToolbarProps } from './AppToolbar.component';

export default {
  title: 'components/AppToolbar',
  component: AppToolbar,
} as Meta;

const Template: Story<AppToolbarProps> = (args) => <AppToolbar {...args} />;

export const Default = Template.bind({});
Default.args = {};
