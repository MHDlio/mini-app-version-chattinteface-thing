import { AISuggestion } from './ai';

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'date' | 'email' | 'tel' | 'url' | 'file';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customValidator?: (value: any) => string | null;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  defaultValue?: any;
  aiEnabled?: boolean;
  aiContext?: string;
  metadata?: Record<string, any>;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: Record<string, FormField>;
  validation?: (formData: Record<string, any>) => Record<string, string>;
}

export interface FormWizardState {
  currentSection: number;
  formData: Record<string, any>;
  errors: Record<string, string>;
  aiSuggestions: Record<string, AISuggestion[]>;
  isProcessing: boolean;
  activeField: string | null;
  completedSections: number[];
  validSections: number[];
}

export interface FormSubmissionData {
  formData: Record<string, any>;
  metadata: {
    completedAt: string;
    duration: number;
    aiAssistance: {
      suggestionsShown: number;
      suggestionsApplied: number;
      fields: string[];
    };
    validationAttempts: number;
  };
}
