import { Story, Meta } from '@storybook/react';
import { App, AppProps } from './App.component';

export default {
  title: 'layout/Components/App',
  component: App,
} as Meta;

const Template: Story<AppProps> = (args: AppProps) => <App {...args} />;

export const Default = Template.bind({});
Default.args = {};
