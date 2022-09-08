import { Story, Meta } from '@storybook/react';
import { LandingPage, LandingPageProps } from './LandingPage.component';

export default {
  title: 'layout/Components/LandingPage',
  component: LandingPage,
} as Meta;

const Template: Story<LandingPageProps> = (args: LandingPageProps) => <LandingPage {...args} />;

export const Default = Template.bind({});
Default.args = {};
