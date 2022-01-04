import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { SelectField } from './SelectField.component';

describe('SelectField', () => {
  const renderComponent = (onSubmit = jest.fn(), defaultValue = '', required = false) => {
    const field = Yup.string().default(defaultValue);
    const Schema = Yup.object({
      testField: required ? field.required('Test field is required') : field,
    });

    const formDefaults = Schema.getDefault();
    return render(
      <Formik initialValues={formDefaults} validationSchema={Schema} onSubmit={(values) => onSubmit(values)}>
        {() => (
          <Form>
            <SelectField
              label="Test label"
              field="testField"
              options={[
                { value: '1', label: 'One' },
                { value: '2', label: 'Two' },
                { value: '3', label: 'Three' },
              ]}
            />
            <Button type="submit">Submit</Button>
          </Form>
        )}
      </Formik>,
    );
  };

  it('supports defaulting to value', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit, '3');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: '3' });
  });

  it('supports switching value', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit);
    fireEvent.mouseDown(screen.getByLabelText('Test label'));
    fireEvent.click(screen.getByRole('option', { name: 'Two' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: '2' });
  });

  it('shows errors', async () => {
    renderComponent(undefined, '', true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByText('Test field is required')).not.toBeNull());
  });
});
