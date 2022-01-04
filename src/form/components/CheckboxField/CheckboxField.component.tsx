import { FC } from 'react';
import { Checkbox, CheckboxProps, FormControlLabel, FormHelperText, makeStyles } from '@material-ui/core';
import { useField } from 'formik';

const useStyles = makeStyles((theme) => ({
  error: {
    color: `${theme.palette.error.main} !important`,
  },
}));

export interface CheckboxFieldProps {
  label: string;
  field: string;
}

type AllProps = CheckboxFieldProps & CheckboxProps;

export const CheckboxField: FC<AllProps> = ({ label, field, ...checkboxProps }) => {
  const classes = useStyles();
  const [fieldProps, meta] = useField(field);
  const showError = meta.touched && Boolean(meta.error);

  return (
    <>
      <FormControlLabel
        className={showError ? classes.error : undefined}
        control={
          <Checkbox
            checked={fieldProps.value}
            inputProps={fieldProps}
            color="primary"
            classes={{
              root: showError ? classes.error : undefined,
            }}
            {...checkboxProps}
          />
        }
        label={label}
      />
      {showError && <FormHelperText error={true}>{meta.error}</FormHelperText>}
    </>
  );
};
