import { Story, Meta } from '@storybook/react';
import * as Yup from 'yup';
import { FormArgs, formDecorator, argTypes, excludeFormArgs } from '../storyUtils';
import { InputField, InputFieldProps } from './InputField.component';

interface StoryArgs {
  defaultValue: string;
  required: boolean;
}

type AllProps = InputFieldProps & FormArgs & StoryArgs;

export default {
  title: 'components/Form/InputField',
  component: InputField,
  argTypes: { ...argTypes },
  decorators: [formDecorator],
} as Meta;

const excludeStoryArgs = (args: AllProps) => {
  const { defaultValue, required, ...rest } = excludeFormArgs(args);
  return rest;
};

const Template: Story<AllProps> = (args) => <InputField {...excludeStoryArgs(args)} />;

export const Default = Template.bind({});
Default.args = {
  defaultValue: '',
  required: false,
  label: 'Test field',
  field: 'testField',
  type: 'input',
  getSchema: (args: any) => {
    const field = Yup.string().default(args.defaultValue);
    const Schema = Yup.object({
      [args.field]: args.required ? field.required(`${args.label} is required`) : field,
    });
    return Schema;
  },
};
