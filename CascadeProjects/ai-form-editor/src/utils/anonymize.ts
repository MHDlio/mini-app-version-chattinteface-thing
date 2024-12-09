// Regular expressions for identifying sensitive data
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  date: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g,
};

const REPLACEMENTS = {
  email: '[EMAIL]',
  phone: '[PHONE]',
  ssn: '[SSN]',
  creditCard: '[CREDIT_CARD]',
  date: '[DATE]',
};

export function anonymizeData(text: string): string {
  let anonymizedText = text;
  
  Object.entries(PATTERNS).forEach(([key, pattern]) => {
    anonymizedText = anonymizedText.replace(pattern, REPLACEMENTS[key as keyof typeof REPLACEMENTS]);
  });

  return anonymizedText;
}

export function detectSensitiveData(text: string): { type: string; count: number }[] {
  return Object.entries(PATTERNS).map(([key, pattern]) => ({
    type: key,
    count: (text.match(pattern) || []).length,
  }));
}

export function hasSensitiveData(text: string): boolean {
  return Object.values(PATTERNS).some(pattern => pattern.test(text));
}
