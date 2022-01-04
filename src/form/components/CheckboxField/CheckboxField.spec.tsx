import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { CheckboxField } from './CheckboxField.component';

describe('CheckboxField', () => {
  const renderComponent = (onSubmit = jest.fn(), defaultValue = false, required = false) => {
    const Schema = Yup.object({
      testField: Yup.boolean()
        .default(defaultValue)
        .oneOf(required ? [true] : [true, false], 'Test field is required'),
    });

    const formDefaults = Schema.getDefault();
    return render(
      <Formik initialValues={formDefaults} validationSchema={Schema} onSubmit={(values) => onSubmit(values)}>
        {() => (
          <Form>
            <CheckboxField label="Test label" field="testField" />
            <Button type="submit">Submit</Button>
          </Form>
        )}
      </Formik>,
    );
  };

  it('supports defaulting to unchecked', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: false });
  });

  it('supports defaulting to checked', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: true });
  });

  it('supports switching value', async () => {
    const onSubmit = jest.fn();
    renderComponent(onSubmit);
    fireEvent.click(screen.getByLabelText('Test label'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toBeCalled());
    expect(onSubmit).toBeCalledWith({ testField: true });
  });

  it('shows errors', async () => {
    renderComponent(undefined, false, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByText('Test field is required')).not.toBeNull());
  });
});
