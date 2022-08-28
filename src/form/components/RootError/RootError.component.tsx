import { FC } from 'react';
import { FormikHelpers, FormikProps } from 'formik';
import { FormHelperText } from '@material-ui/core';

export function handleRootErrors<Values>(onSubmit: (values: Values, actions: FormikHelpers<Values>) => Promise<void>) {
  return async (values: Values, actions: FormikHelpers<Values>): Promise<void> => {
    actions.setFieldError('_root', '');
    try {
      await onSubmit(values, actions);
    } catch (err: any) {
      actions.setFieldError('_root', err.message);
    }
  };
}

export interface RootErrorProps {
  formProps: FormikProps<any>;
}

export const RootError: FC<RootErrorProps> = ({ formProps }) => {
  const error = (formProps.errors as any)['_root'];
  if (!error) {
    return null;
  }
  return <FormHelperText error={true}>{error}</FormHelperText>;
};
