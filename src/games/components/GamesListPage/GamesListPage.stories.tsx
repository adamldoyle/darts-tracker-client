import { Story, Meta } from '@storybook/react';
import { GamesListPage, GamesListPageProps } from './GamesListPage.component';

export default {
  title: 'games/Components/GamesListPage',
  component: GamesListPage,
} as Meta;

const Template: Story<GamesListPageProps> = (args: GamesListPageProps) => <GamesListPage {...args} />;

export const Default = Template.bind({});
Default.args = {};
