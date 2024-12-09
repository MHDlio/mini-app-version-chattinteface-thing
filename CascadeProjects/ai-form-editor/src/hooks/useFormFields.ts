import { useState, useCallback } from 'react';
import type { FormField } from '@/types/form';

export const useFormFields = (initialFields: FormField[]) => {
  const [fields, setFields] = useState(initialFields);

  const updateField = useCallback((id: string, value: string) => {
    setFields(prev => prev.map(field => {
      if (field.id === id) {
        const isValid = field.validation ? field.validation(value) : true;
        return { ...field, value, isValid };
      }
      return field;
    }));
  }, []);

  const resetFields = useCallback(() => {
    setFields(initialFields);
  }, [initialFields]);

  return {
    fields,
    updateField,
    resetFields
  };
};

export default useFormFields;
