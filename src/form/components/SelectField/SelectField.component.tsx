import { FC } from 'react';
import { Select, SelectProps, FormControl, InputLabel, FormHelperText, MenuItem } from '@material-ui/core';
import { useField } from 'formik';

interface SelectFieldOption {
  value: any;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  field: string;
  options: SelectFieldOption[];
}

type AllProps = SelectFieldProps & SelectProps;

export const SelectField: FC<AllProps> = ({ label, field, options, ...selectFieldProps }) => {
  const [fieldProps, meta] = useField(field);
  const showError = meta.touched && Boolean(meta.error);
  return (
    <FormControl fullWidth error={showError}>
      <InputLabel id={`${field}-select`}>{label}</InputLabel>
      <Select labelId={`${field}-select`} fullWidth error={showError} inputProps={fieldProps} {...selectFieldProps}>
        {options.map(({ label, value }) => (
          <MenuItem key={label} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
      {showError && <FormHelperText error={true}>{meta.error}</FormHelperText>}
    </FormControl>
  );
};
