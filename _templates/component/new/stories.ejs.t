---
to: src/<% if (locals.Subfolder) { -%><%= Subfolder %>/<% } -%>components/<%= Name %>/<%= Name %>.stories.tsx
---
import { Story, Meta } from '@storybook/react';
import { <%= Name %>, <%= Name %>Props } from './<%= Name %>.component';

export default {
  title: '<%= Subfolder %>/Components/<%= Name %>',
  component: <%= Name %>,
} as Meta;

const Template: Story<<%= Name %>Props> = (args: <%= Name %>Props) => <<%= Name %> {...args} />;

export const Default = Template.bind({});
Default.args = {};
