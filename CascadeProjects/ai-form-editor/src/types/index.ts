export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  value: any;
  options?: SelectOption[];
  validation?: ValidationRule[];
  aiSuggestions?: AISuggestion[];
  context?: FieldContext;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: Record<string, FormField>;
  order: number;
  isOptional?: boolean;
}

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
  SIGNATURE = 'signature'
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: string;
  message: string;
  validator: (value: any) => boolean;
}

export interface AISuggestion {
  id: string;
  fieldId: string;
  value: any;
  confidence: number;
  source: string;
  context?: AIContext;
  metadata: {
    userFeedback?: boolean;
    appliedAt?: string;
    processingTime?: number;
    modelVersion?: string;
    suggestionRank?: number;
  };
}

export interface AIContext {
  fieldType: FieldType;
  fieldId: string;
  sectionId: string;
  previousValue: any;
  userInput: any;
  documentContext?: any;
  timestamp: string;
  metadata: {
    formType: string;
    domain?: string;
    language?: string;
    userPreferences?: Record<string, any>;
    interactionHistory?: Array<{
      action: string;
      timestamp: string;
      value: any;
    }>;
  };
}

export interface FieldContext {
  relevance: number;
  dependencies: string[];
  aiContext?: AIContext;
  metadata?: Record<string, any>;
}

export interface DocumentProcessingResult {
  text: string;
  confidence: number;
  fields: Record<string, string>;
  metadata: {
    pageCount: number;
    fileType: string;
    processingTime: number;
    ocrConfidence: number;
  };
}

export interface AIModelResponse {
  suggestions: AISuggestion[];
  confidence: number;
  processingTime: number;
  metadata: {
    modelVersion: string;
    contextQuality: number;
    suggestionsCount: number;
    cachingStatus?: 'hit' | 'miss';
    performanceMetrics?: {
      latency: number;
      tokenCount: number;
      modelLoadTime: number;
    };
  };
}

export interface AIFeedback {
  id: string;
  suggestionId: string;
  fieldId: string;
  helpful: boolean;
  context?: AIContext;
  timestamp: string;
  userId: string;
  metadata: {
    interactionDuration: number;
    subsequentEdits: boolean;
    applicationMethod: 'click' | 'keyboard' | 'voice';
    performanceMetrics?: {
      responseTime: number;
      contextSize: number;
    };
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  sections: FormSection[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    category: string;
    tags: string[];
  };
  settings: {
    allowAIAssistance: boolean;
    requireValidation: boolean;
    autoSave: boolean;
    language: string;
  };
}
