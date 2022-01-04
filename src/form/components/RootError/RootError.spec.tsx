import { render } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { RootError } from './RootError.component';

describe('RootError', () => {
  it('renders', () => {
    const formDefaults = {
      field: '',
    };
    render(
      <Formik initialValues={formDefaults} onSubmit={() => {}}>
        {(formProps) => (
          <Form>
            <RootError formProps={formProps} />
          </Form>
        )}
      </Formik>,
    );
  });
});
