import { Story, Meta } from '@storybook/react';
import * as Yup from 'yup';
import { FormArgs, formDecorator, argTypes, excludeFormArgs } from '../storyUtils';
import { LeagueMemberListForm, LeagueMemberListFormProps } from './LeagueMemberListForm.component';

interface StoryArgs {
  required: boolean;
}

type AllProps = LeagueMemberListFormProps & FormArgs & StoryArgs;

export default {
  title: 'components/Form/LeagueMemberListForm',
  component: LeagueMemberListForm,
  argTypes: { ...argTypes },
  decorators: [formDecorator],
} as Meta;

const excludeStoryArgs = (args: AllProps) => {
  const { required, ...rest } = excludeFormArgs(args);
  return rest;
};

const Template: Story<AllProps> = (args) => <LeagueMemberListForm {...excludeStoryArgs(args)} />;

export const Default = Template.bind({});
Default.args = {
  required: false,
  label: 'Test field',
  rowLabel: 'Name',
  field: 'testField',
  getSchema: (args: any) => {
    const field = Yup.array()
      .of(Yup.string().default('').required(`${args.rowLabel} is required`))
      .default(['One', 'Two', 'Three']);
    const Schema = Yup.object({
      [args.field]: args.required ? field.min(1, `${args.label} is required`) : field,
    });
    return Schema;
  },
};
