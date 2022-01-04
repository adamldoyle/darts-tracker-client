import { Story, Meta } from '@storybook/react';
import * as Yup from 'yup';
import { FormArgs, formDecorator, argTypes, excludeFormArgs } from '../storyUtils';
import { CheckboxField, CheckboxFieldProps } from './CheckboxField.component';

interface StoryArgs {
  defaultValue: boolean;
  required: boolean;
}

type AllProps = CheckboxFieldProps & FormArgs & StoryArgs;

export default {
  title: 'components/Form/CheckboxField',
  component: CheckboxField,
  argTypes: { ...argTypes },
  decorators: [formDecorator],
} as Meta;

const excludeStoryArgs = (args: AllProps) => {
  const { defaultValue, required, ...rest } = excludeFormArgs(args);
  return rest;
};

const Template: Story<AllProps> = (args) => <CheckboxField {...excludeStoryArgs(args)} />;

export const Default = Template.bind({});
Default.args = {
  defaultValue: false,
  required: false,
  label: 'Test field',
  field: 'testField',
  getSchema: (args: any) => {
    const Schema = Yup.object({
      [args.field]: Yup.boolean()
        .oneOf(args.required ? [true] : [true, false], `${args.label} is required`)
        .default(args.defaultValue),
    });
    return Schema;
  },
};
