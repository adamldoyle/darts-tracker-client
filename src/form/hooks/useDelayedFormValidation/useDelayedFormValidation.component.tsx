import React, { useState, useCallback } from 'react';
import { FormikProps } from 'formik';

export interface IDelayedFormValidation<Values> {
  formikValidationProps: {
    validateOnChange: boolean;
    validateOnBlur: boolean;
  };
  onSubmit: (formProps: FormikProps<Values>) => (evt: React.FormEvent<HTMLFormElement>) => void;
}

export function useDelayedFormValidation<Values>(): IDelayedFormValidation<Values> {
  const [validationEnabled, setValidationEnabled] = useState(false);

  const formikValidationProps = {
    validateOnChange: validationEnabled,
    validateOnBlur: validationEnabled,
  };

  const onSubmit = useCallback(
    (formProps: FormikProps<Values>) => (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      setValidationEnabled(true);
      formProps.handleSubmit();
    },
    [],
  );

  return { formikValidationProps, onSubmit };
}
