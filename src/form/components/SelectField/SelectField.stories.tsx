import { Story, Meta } from '@storybook/react';
import * as Yup from 'yup';
import { FormArgs, formDecorator, argTypes, excludeFormArgs } from '../storyUtils';
import { SelectField, SelectFieldProps } from './SelectField.component';

interface StoryArgs {
  defaultValue: string;
  required: boolean;
}

type AllProps = SelectFieldProps & FormArgs & StoryArgs;

export default {
  title: 'components/Form/SelectField',
  component: SelectField,
  argTypes: { ...argTypes },
  decorators: [formDecorator],
} as Meta;

const excludeStoryArgs = (args: AllProps) => {
  const { defaultValue, required, ...rest } = excludeFormArgs(args);
  return rest;
};

const Template: Story<AllProps> = (args) => <SelectField {...excludeStoryArgs(args)} />;

export const Default = Template.bind({});
Default.args = {
  defaultValue: '',
  required: false,
  label: 'Test field',
  field: 'testField',
  options: [
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' },
    { value: '3', label: 'Three' },
  ],
  getSchema: (args: any) => {
    const field = Yup.string().default(args.defaultValue);
    const Schema = Yup.object({
      [args.field]: args.required ? field.required(`${args.label} is required`) : field,
    });
    return Schema;
  },
};
