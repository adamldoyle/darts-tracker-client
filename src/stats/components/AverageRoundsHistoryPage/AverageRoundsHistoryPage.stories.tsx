import { Story, Meta } from '@storybook/react';
import { AverageRoundsHistoryPage, AverageRoundsHistoryPageProps } from './AverageRoundsHistoryPage.component';

export default {
  title: 'stats/Components/AverageRoundsHistoryPage',
  component: AverageRoundsHistoryPage,
} as Meta;

const Template: Story<AverageRoundsHistoryPageProps> = (args: AverageRoundsHistoryPageProps) => (
  <AverageRoundsHistoryPage {...args} />
);

export const Default = Template.bind({});
Default.args = {};
