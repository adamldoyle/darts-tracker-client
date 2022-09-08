import { Story, Meta } from '@storybook/react';
import { EloHistoryPage, EloHistoryPageProps } from './EloHistoryPage.component';

export default {
  title: 'stats/Components/EloHistoryPage',
  component: EloHistoryPage,
} as Meta;

const Template: Story<EloHistoryPageProps> = (args: EloHistoryPageProps) => <EloHistoryPage {...args} />;

export const Default = Template.bind({});
Default.args = {};
