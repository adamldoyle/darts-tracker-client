import { Story, Meta } from '@storybook/react';
import { Formik, Form } from 'formik';
import { RootError, RootErrorProps } from './RootError.component';

const formDefaults = {};

export default {
  title: 'components/Form/RootError',
  component: RootError,
} as Meta;

const Template: Story<RootErrorProps> = (args) => {
  return (
    <Formik initialValues={formDefaults} onSubmit={() => {}}>
      {(formProps) => (
        <Form>
          <RootError {...args} formProps={{ ...formProps, ...args.formProps }} />
        </Form>
      )}
    </Formik>
  );
};

export const Default = Template.bind({});
Default.args = {
  formProps: {
    errors: {
      _root: 'Sample root error',
    },
  } as any,
};

export const NoError = Template.bind({});
NoError.args = {
  formProps: {
    errors: {},
  } as any,
};
