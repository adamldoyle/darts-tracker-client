import { Story, Meta } from '@storybook/react';
import { Scoreboard, ScoreboardProps } from './Scoreboard.component';

export default {
  title: 'scoreboard/Components/Scoreboard',
  component: Scoreboard,
} as Meta;

const Template: Story<ScoreboardProps> = (args: ScoreboardProps) => <Scoreboard {...args} />;

export const Default = Template.bind({});
Default.args = {};
