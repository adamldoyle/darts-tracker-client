import { Story, Meta } from '@storybook/react';
import { CreateGamePage, CreateGamePageProps } from './CreateGamePage.component';

export default {
  title: 'games/Components/CreateGamePage',
  component: CreateGamePage,
} as Meta;

const Template: Story<CreateGamePageProps> = (args: CreateGamePageProps) => <CreateGamePage {...args} />;

export const Default = Template.bind({});
Default.args = {};
