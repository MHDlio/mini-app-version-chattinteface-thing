import { FormField } from '../../types/form';

const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/g,
  ssn: /\d{3}[- ]?\d{2}[- ]?\d{4}/g,
  creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
};

export function anonymizeFieldValue(value: any, field: FormField): any {
  if (!value || typeof value !== 'string') return value;

  // Check if field is marked as sensitive
  if (field.metadata?.sensitive) {
    return '[REDACTED]';
  }

  let anonymizedValue = value;

  // Replace PII patterns with placeholders
  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    anonymizedValue = anonymizedValue.replace(pattern, `[${type.toUpperCase()}]`);
  });

  return anonymizedValue;
}

export function detectPII(text: string): {
  hasPII: boolean;
  detectedTypes: string[];
} {
  const detectedTypes = Object.entries(PII_PATTERNS)
    .filter(([_, pattern]) => pattern.test(text))
    .map(([type]) => type);

  return {
    hasPII: detectedTypes.length > 0,
    detectedTypes,
  };
}

export function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      sanitized[key] = anonymizeFieldValue(value, { metadata: { sensitive: false } } as FormField);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
