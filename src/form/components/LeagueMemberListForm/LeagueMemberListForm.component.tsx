import React, { FC, useEffect, useRef } from 'react';
import {
  TextField,
  TextFieldProps,
  IconButton,
  Grid,
  Tooltip,
  FormHelperText,
  FormControl,
  Typography, InputAdornment,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useField } from 'formik';
import { Timer } from '@material-ui/icons';

const generateHashColor = async (text: string) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const hasArray = new Uint8Array(hashBuffer);
  const hasAsText = Array.from(hasArray).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hasAsText.slice(0,6)}`;
}

export interface LeagueMemberListFormProps {
  label: string;
  rowLabel: string;
  field: string;
}

type AllProps = LeagueMemberListFormProps & TextFieldProps;

export const LeagueMemberListForm: FC<AllProps> = ({ label, rowLabel, field, inputProps, InputProps, ...textFieldProps }) => {
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

  const handleChange = (rowIdx: number, _updateField: string) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [...fieldProps.value];
    newValue.splice(rowIdx, 1, {...(newValue[rowIdx]), [_updateField]: evt.target.value});
    helpers.setValue(newValue);
  };

  // generate color with email
  const isDoneWithEmail = useRef<number | null>(null);
  useEffect(() => {
    if (isDoneWithEmail.current !== null && fieldProps.value?.[isDoneWithEmail.current]?.["email"] && !fieldProps.value?.[isDoneWithEmail.current]?.['colorCode']) {
      (async (rowIdx: number) => {
        const defaultColor = await generateHashColor(fieldProps.value?.[rowIdx]?.["email"]);
        const newValue = [...fieldProps.value];
        newValue.splice(rowIdx, 1, {...(newValue[rowIdx]), colorCode: defaultColor});
        helpers.setValue(newValue);
        isDoneWithEmail.current = null;
      })(isDoneWithEmail.current);
    } else if (isDoneWithEmail.current !== null) {
      // reset value
      isDoneWithEmail.current = null;
    }
  }, [isDoneWithEmail.current]);

  return (
    <FormControl fullWidth error={showRootError}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography color={showRootError ? 'error' : undefined}>{label}</Typography>
        </Grid>
        {fieldProps.value.map((rowValue: Record<string, string>, rowIdx: number) => {
          const showError = meta.touched && Array.isArray(meta.error) && Boolean(meta.error?.[rowIdx]);
          return (
            <Grid key={rowIdx} item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    id={`${field}-input-${rowIdx}-email`}
                    name={`${field}-${rowIdx}-email`}
                    label="Member"
                    fullWidth
                    error={showError}
                    helperText={showError ? meta.error?.[rowIdx] : undefined}
                    value={rowValue?.['email'] ?? ''}
                    onChange={handleChange(rowIdx, 'email')}
                    onBlur={(evt) => {
                      fieldProps.onBlur(evt);
                      isDoneWithEmail.current = rowIdx;
                    }}
                    {...textFieldProps}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id={`${field}-input-${rowIdx}-displayName`}
                    name={`${field}-${rowIdx}-displayName`}
                    label="Name"
                    fullWidth
                    error={showError}
                    helperText={showError ? meta.error?.[rowIdx] : undefined}
                    value={rowValue?.['displayName'] ?? ''}
                    onChange={handleChange(rowIdx, 'displayName')}
                    onBlur={fieldProps.onBlur}
                    {...textFieldProps}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id={`${field}-input-${rowIdx}-colorCode`}
                    name={`${field}-${rowIdx}-colorCode`}
                    label="Color code"
                    fullWidth
                    error={showError}
                    helperText={showError ? meta.error?.[rowIdx] : undefined}
                    value={rowValue?.['colorCode'] ?? ''}
                    onChange={handleChange(rowIdx, 'colorCode')}
                    onBlur={fieldProps.onBlur}
                    {...textFieldProps}
                    inputProps={{
                      ...inputProps,
                      maxLength: 6,
                    }}
                    InputProps={{
                      ...InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start"><Typography color="textSecondary">#</Typography></InputAdornment>
                          {InputProps?.endAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          <InputAdornment position="end">{isDoneWithEmail.current === rowIdx ? <Timer /> : <div style={{ height: '12px', width: '12px', border: '1px solid black', backgroundColor: `#${rowValue?.['colorCode']}`}}></div>}</InputAdornment>
                          {InputProps?.endAdornment}
                        </>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
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
