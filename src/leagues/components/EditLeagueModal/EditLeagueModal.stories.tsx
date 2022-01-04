import { Story, Meta } from '@storybook/react';
import { EditLeagueModal, EditLeagueModalProps } from './EditLeagueModal.component';

export default {
  title: 'leagues/Components/EditLeagueModal',
  component: EditLeagueModal,
} as Meta;

const Template: Story<EditLeagueModalProps> = (args: EditLeagueModalProps) => <EditLeagueModal {...args} />;

export const Default = Template.bind({});
Default.args = {};
