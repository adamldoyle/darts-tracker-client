import React, { FC } from 'react';
import {
  TextField,
  TextFieldProps,
  IconButton,
  Grid,
  Tooltip,
  FormHelperText,
  FormControl,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useField } from 'formik';

export interface InputFieldListProps {
  label: string;
  rowLabel: string;
  field: string;
}

type AllProps = InputFieldListProps & TextFieldProps;

export const InputFieldList: FC<AllProps> = ({ label, rowLabel, field, ...textFieldProps }) => {
  const [fieldProps, meta, helpers] = useField(field);
  const showRootError = meta.touched && typeof meta.error === 'string' && Boolean(meta.error);

  const addRow = () => {
    helpers.setValue([...fieldProps.value, '']);
  };

  const removeRow = (rowIdx: number) => () => {
    const newValue = [...fieldProps.value];
    newValue.splice(rowIdx, 1);
    helpers.setValue(newValue);
  };

  const handleChange = (rowIdx: number) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [...fieldProps.value];
    newValue.splice(rowIdx, 1, evt.target.value);
    helpers.setValue(newValue);
  };

  return (
    <FormControl fullWidth error={showRootError}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography color={showRootError ? 'error' : undefined}>{label}</Typography>
        </Grid>
        {fieldProps.value.map((rowValue: string, rowIdx: number) => {
          const showError = meta.touched && Array.isArray(meta.error) && Boolean(meta.error?.[rowIdx]);
          return (
            <Grid key={rowIdx} item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                id={`${field}-input-${rowIdx}`}
                name={`${field}-${rowIdx}`}
                label={rowLabel}
                fullWidth
                error={showError}
                helperText={showError ? meta.error?.[rowIdx] : undefined}
                value={rowValue}
                onChange={handleChange(rowIdx)}
                onBlur={fieldProps.onBlur}
                {...textFieldProps}
              />
              <Tooltip title="Remove row">
                <IconButton onClick={removeRow(rowIdx)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          );
        })}
        {showRootError && (
          <Grid item xs={12}>
            <FormHelperText error={true}>{meta.error}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12}>
          <Tooltip title="Add row">
            <IconButton onClick={addRow}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </FormControl>
  );
};
