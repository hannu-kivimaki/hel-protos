import { useState } from 'react';

/**
 * Simple form state hook
 * Extend as needed for your prototype
 */
export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error when field is modified
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const setError = (key: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [key]: message }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, setValue, setError, reset };
}
