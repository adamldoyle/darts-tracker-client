import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { InputField } from './InputField.component';

describe('InputField', () => {
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
            <InputField label="Test label" field="testField" />
            <Button type="submit">Submit</Button>
          </Form>
        )}
      </Formik>,
    );
  };

  it('supports defaulting to value', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit, 'defaultValue');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: 'defaultValue' });
  });

  it('supports switching value', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit);
    fireEvent.change(screen.getByLabelText('Test label'), {
      target: { value: 'newValue' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: 'newValue' });
  });

  it('shows errors', async () => {
    renderComponent(undefined, '', true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByText('Test field is required')).not.toBeNull());
  });
});
