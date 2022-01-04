import { Story, Meta } from '@storybook/react';
import { App } from './App.component';

export default {
  title: 'components/App',
  component: App,
} as Meta;

const Template: Story = () => <App />;

export const Default = Template.bind({});
Default.args = {};
