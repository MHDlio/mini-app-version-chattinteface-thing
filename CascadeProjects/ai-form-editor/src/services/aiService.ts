import { FormField, FormSection } from '../types/form';
import { AISuggestion, AIContext, AIModelResponse, AIFeedback, AIModelConfig } from '../types/ai';
import { anonymizeFieldValue } from '../utils/privacy';
import { AIService } from './aiService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const AI_MODEL_CONFIG: AIModelConfig = {
  endpoint: `${API_BASE_URL}/api/ai/model`,
  version: '1.0.0',
  parameters: {
    temperature: 0.7,
    maxTokens: 100,
    topK: 5,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
  },
  features: {
    contextLearning: true,
    feedbackProcessing: true,
    realTimeSuggestions: true,
    batchProcessing: true,
  },
};

const aiService = new AIService('your-api-key', `${API_BASE_URL}/api/ai/model`);

// Function to get AI suggestions for a field with context learning
export async function getAISuggestions(
  field: FormField,
  value: any,
  section: FormSection,
  context?: AIContext,
  signal?: AbortSignal
): Promise<AISuggestion[]> {
  try {
    const anonymizedValue = anonymizeFieldValue(value, field);
    const timestamp = new Date().toISOString();

    const aiContext: AIContext = context || {
      fieldType: field.type,
      fieldId: field.id,
      sectionId: section.id,
      previousValue: field.value,
      userInput: anonymizedValue,
      documentContext: field.aiContext,
      timestamp,
      metadata: {
        formType: section.type,
        domain: field.domain,
        language: field.language,
        userPreferences: field.userPreferences,
      },
    };

    const response = await aiService.getSuggestions([{ id: field.id, value: anonymizedValue }], aiContext);

    return response.map(suggestion => ({
      id: suggestion.id,
      text: suggestion.suggestions[0],
      confidence: suggestion.confidence,
    }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Rethrow AbortError for proper handling
    }
    console.error('AI suggestion error:', error);
    throw error;
  }
}

// Function to send feedback with context learning
export async function sendAIFeedback(
  suggestionId: string,
  helpful: boolean,
  fieldId: string,
  context?: AIContext
): Promise<void> {
  try {
    const feedback: AIFeedback = {
      id: crypto.randomUUID(),
      suggestionId,
      fieldId,
      helpful,
      context: context || await getDefaultContext(fieldId),
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId(),
      metadata: {
        interactionDuration: calculateInteractionDuration(),
        subsequentEdits: hasSubsequentEdits(fieldId),
        applicationMethod: getApplicationMethod(),
      },
    };

    await aiService.makeRequest('/feedback', 'POST', feedback);

    // Trigger model retraining if feedback batch threshold is met
    await checkAndTriggerRetraining();
  } catch (error) {
    console.error('AI feedback error:', error);
    throw error;
  }
}

// Function to get enhanced AI help context
export async function getAIHelpContext(
  field: FormField,
  section: FormSection
): Promise<AIContext> {
  const timestamp = new Date().toISOString();
  
  return {
    fieldType: field.type,
    fieldId: field.id,
    sectionId: section.id,
    documentContext: await generateDocumentContext(field, section),
    timestamp,
    metadata: {
      formType: section.type,
      domain: field.domain,
      language: field.language,
    },
  };
}

// Helper functions
function getCurrentUserId(): string {
  // Implementation to get current user ID
  return 'user-id';
}

function calculateInteractionDuration(): number {
  // Implementation to calculate interaction duration
  return 0;
}

function hasSubsequentEdits(fieldId: string): boolean {
  // Implementation to check for subsequent edits
  return false;
}

function getApplicationMethod(): 'click' | 'keyboard' | 'voice' {
  // Implementation to determine how the suggestion was applied
  return 'click';
}

async function getDefaultContext(fieldId: string): Promise<AIContext> {
  // Implementation to get default context
  return {
    fieldType: 'text',
    fieldId,
    timestamp: new Date().toISOString(),
  };
}

async function generateDocumentContext(
  field: FormField,
  section: FormSection
): Promise<string> {
  // Implementation to generate document context
  return '';
}

async function checkAndTriggerRetraining(): Promise<void> {
  try {
    const response = await aiService.makeRequest('/retrain/check', 'POST');

    if (response.shouldRetrain) {
      await aiService.makeRequest('/retrain/trigger', 'POST');
    }
  } catch (error) {
    console.error('Retraining check error:', error);
  }
}
