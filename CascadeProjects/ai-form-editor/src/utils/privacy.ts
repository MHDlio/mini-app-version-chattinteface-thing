import { FormField } from '../types/form';

// Regular expressions for detecting common PII patterns
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/g,
  ssn: /\d{3}[-]?\d{2}[-]?\d{4}/g,
  creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
  ipAddress: /(\d{1,3}\.){3}\d{1,3}/g,
};

// Mask different types of PII with appropriate placeholders
const maskValue = (value: string, type: keyof typeof PII_PATTERNS): string => {
  switch (type) {
    case 'email':
      return value.replace(PII_PATTERNS.email, '[EMAIL]');
    case 'phone':
      return value.replace(PII_PATTERNS.phone, '[PHONE]');
    case 'ssn':
      return value.replace(PII_PATTERNS.ssn, '[SSN]');
    case 'creditCard':
      return value.replace(PII_PATTERNS.creditCard, '[CREDIT_CARD]');
    case 'ipAddress':
      return value.replace(PII_PATTERNS.ipAddress, '[IP_ADDRESS]');
    default:
      return value;
  }
};

// Anonymize field value based on field type and content
export const anonymizeFieldValue = (value: any, field: FormField): any => {
  if (!value) return value;

  // Handle different field types
  switch (field.type) {
    case 'email':
      return typeof value === 'string' ? maskValue(value, 'email') : value;
    case 'tel':
      return typeof value === 'string' ? maskValue(value, 'phone') : value;
    case 'text':
    case 'textarea':
      if (typeof value !== 'string') return value;
      
      // Apply all PII masks
      let maskedValue = value;
      Object.keys(PII_PATTERNS).forEach((type) => {
        maskedValue = maskValue(maskedValue, type as keyof typeof PII_PATTERNS);
      });
      return maskedValue;
      
    default:
      return value;
  }
};

// Anonymize form data for AI processing
export const anonymizeFormData = (
  formData: Record<string, any>,
  fields: Record<string, FormField>
): Record<string, any> => {
  const anonymizedData: Record<string, any> = {};

  Object.entries(formData).forEach(([fieldId, value]) => {
    const field = fields[fieldId];
    if (field) {
      anonymizedData[fieldId] = anonymizeFieldValue(value, field);
    }
  });

  return anonymizedData;
};
