import { FC } from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import { useField } from 'formik';

export interface InputFieldProps {
  label: string;
  field: string;
  type?: string;
}

type AllProps = InputFieldProps & TextFieldProps;

export const InputField: FC<AllProps> = ({ label, field, type, ...textFieldProps }) => {
  const [fieldProps, meta] = useField(field);
  const showError = meta.touched && Boolean(meta.error);
  return (
    <TextField
      id={`${field}-input`}
      type={type ?? 'text'}
      label={label}
      fullWidth
      error={showError}
      helperText={showError ? meta.error : undefined}
      InputProps={fieldProps}
      {...textFieldProps}
    />
  );
};
