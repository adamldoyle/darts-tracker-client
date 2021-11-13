import { Story, Meta } from '@storybook/react';
import { DartboardWrapper, DartboardWrapperProps } from './DartboardWrapper.component';

export default {
  title: 'scoreboard/Components/DartboardWrapper',
  component: DartboardWrapper,
} as Meta;

const Template: Story<DartboardWrapperProps> = (args: DartboardWrapperProps) => <DartboardWrapper {...args} />;

export const Default = Template.bind({});
Default.args = {
  size: 400,
};
