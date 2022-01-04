import { Story, Meta } from '@storybook/react';
import { LeaguesList, LeaguesListProps } from './LeaguesList.component';

export default {
  title: 'leagues/Components/LeaguesList',
  component: LeaguesList,
} as Meta;

const Template: Story<LeaguesListProps> = (args: LeaguesListProps) => <LeaguesList {...args} />;

export const Default = Template.bind({});
Default.args = {};
