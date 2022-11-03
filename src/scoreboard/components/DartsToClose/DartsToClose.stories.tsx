import { Story, Meta } from '@storybook/react';
import { DartsToClose, DartsToCloseProps } from './DartsToClose.component';

export default {
  title: 'scoreboard/Components/DartsToClose',
  component: DartsToClose,
} as Meta;

const Template: Story<DartsToCloseProps> = (args: DartsToCloseProps) => <DartsToClose {...args} />;

export const Default = Template.bind({});
Default.args = {};
