import { StoryContext } from '@storybook/react';
import { StoryFnReactReturnType } from '@storybook/react/dist/ts3.9/client/preview/types';
import { Button, Box } from '@material-ui/core';
import { Formik, Form } from 'formik';

export interface FormArgs {
  onSubmit: (values: unknown) => {};
  getSchema: <T extends FormArgs>(args: T) => any;
}

export const argTypes = { onSubmit: { action: 'clicked' } };

export const excludeFormArgs = <T extends FormArgs>(args: T) => {
  const { onSubmit, getSchema, ...otherArgs } = args;
  return otherArgs;
};

export const formDecorator = (Story: () => StoryFnReactReturnType, context: StoryContext) => {
  const args = context.args;
  const { onSubmit, getSchema, ...otherArgs } = args;
  const Schema = getSchema(args);

  const formDefaults = Schema.getDefault();
  return (
    <Formik
      initialValues={formDefaults}
      validationSchema={Schema}
      onSubmit={((values: unknown) => onSubmit(values)) as any}
    >
      {() => (
        <Form>
          <Box>
            <Story {...otherArgs} />
          </Box>
          <Box>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};
