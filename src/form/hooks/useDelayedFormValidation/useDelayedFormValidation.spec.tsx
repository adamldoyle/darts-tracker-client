import { renderHook, act } from '@testing-library/react-hooks';
import { useDelayedFormValidation } from './useDelayedFormValidation.component';

describe('useDelayedFormValidation', () => {
  test('starts with validation turned off', () => {
    const rendered = renderHook(() => useDelayedFormValidation());
    expect(rendered.result.current.formikValidationProps.validateOnBlur).toBeFalsy();
    expect(rendered.result.current.formikValidationProps.validateOnChange).toBeFalsy();
  });

  test('turns validation on after submit', () => {
    const rendered = renderHook(() => useDelayedFormValidation());
    const handleSubmit = jest.fn();
    const preventDefault = jest.fn();
    act(() => {
      rendered.result.current.onSubmit({ handleSubmit } as any)({
        preventDefault,
      } as any);
    });
    expect(rendered.result.current.formikValidationProps.validateOnBlur).toBeTruthy();
    expect(rendered.result.current.formikValidationProps.validateOnChange).toBeTruthy();
    expect(preventDefault).toBeCalled();
    expect(handleSubmit).toBeCalled();
  });
});
