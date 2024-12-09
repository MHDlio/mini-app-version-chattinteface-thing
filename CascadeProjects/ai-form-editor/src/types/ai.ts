export interface AISuggestion {
  id: string;
  value: string;
  confidence: number;
  source: string;
  type: 'field' | 'validation' | 'completion' | 'translation';
  metadata?: {
    fieldId?: string;
    language?: string;
    context?: string;
    alternatives?: string[];
    modelVersion?: string;
    featureImportance?: Record<string, number>;
  };
  timestamp: string;
}

export interface AIAssistantState {
  isVisible: boolean;
  position: { x: number; y: number } | null;
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
  activeField: string | null;
  activeSection: string | null;
  feedbackInProgress: Set<string>;
  contextHistory: AIContext[];
}

export interface AIAssistantContextType {
  state: AIAssistantState;
  showAssistant: (fieldId: string, position: { x: number; y: number }, context?: AIContext) => void;
  hideAssistant: () => void;
  applySuggestion: (suggestion: AISuggestion) => Promise<void>;
  refreshSuggestions: (fieldId: string, context?: AIContext) => Promise<void>;
  provideFeedback: (suggestionId: string, helpful: boolean, context?: AIContext) => Promise<void>;
  updateContext: (context: AIContext) => void;
}

export interface AIContext {
  fieldType: string;
  fieldId: string;
  sectionId?: string;
  previousValue?: string;
  userInput?: string;
  documentContext?: string;
  timestamp: string;
  metadata?: {
    formType?: string;
    domain?: string;
    language?: string;
    userPreferences?: Record<string, any>;
  };
}

export interface AIModelResponse {
  suggestions: AISuggestion[];
  metadata: {
    modelVersion: string;
    processingTime: number;
    confidence: number;
    contextUsed: boolean;
  };
}

export interface AIFeedback {
  id: string;
  suggestionId: string;
  fieldId: string;
  helpful: boolean;
  context: AIContext;
  timestamp: string;
  userId: string;
  metadata?: {
    interactionDuration?: number;
    subsequentEdits?: boolean;
    applicationMethod?: 'click' | 'keyboard' | 'voice';
  };
}

export interface AIModelConfig {
  endpoint: string;
  version: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topK: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  features: {
    contextLearning: boolean;
    feedbackProcessing: boolean;
    realTimeSuggestions: boolean;
    batchProcessing: boolean;
  };
}
