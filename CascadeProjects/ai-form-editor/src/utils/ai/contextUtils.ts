import { AIContext } from '../../types/ai';
import { FormField, FormSection } from '../../types/form';
import { anonymizeFieldValue } from './privacyUtils';

export function createAIContext(
  field: FormField,
  value: any,
  section: FormSection,
  previousContext?: AIContext
): AIContext {
  const timestamp = new Date().toISOString();
  const anonymizedValue = anonymizeFieldValue(value, field);

  return {
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
      interactionHistory: previousContext
        ? [...previousContext.metadata.interactionHistory || [], {
            action: 'update',
            timestamp,
            value: anonymizedValue,
          }]
        : [{
            action: 'create',
            timestamp,
            value: anonymizedValue,
          }],
    },
  };
}

export function mergeContexts(contexts: AIContext[]): AIContext {
  if (!contexts.length) {
    throw new Error('Cannot merge empty context array');
  }

  const latestContext = contexts[contexts.length - 1];
  const mergedInteractionHistory = contexts.reduce((history, context) => {
    return [...history, ...(context.metadata.interactionHistory || [])];
  }, [] as AIContext['metadata']['interactionHistory']);

  return {
    ...latestContext,
    metadata: {
      ...latestContext.metadata,
      interactionHistory: mergedInteractionHistory,
    },
  };
}

export function pruneContextHistory(
  contextHistory: AIContext[],
  maxSize: number = 50
): AIContext[] {
  if (contextHistory.length <= maxSize) {
    return contextHistory;
  }

  return contextHistory.slice(-maxSize);
}

export function calculateContextRelevance(
  context: AIContext,
  currentField: FormField
): number {
  const timeRelevance = calculateTimeRelevance(context.timestamp);
  const fieldRelevance = calculateFieldRelevance(context, currentField);
  const interactionRelevance = calculateInteractionRelevance(context);

  return (timeRelevance + fieldRelevance + interactionRelevance) / 3;
}

function calculateTimeRelevance(timestamp: string): number {
  const age = Date.now() - new Date(timestamp).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  return Math.max(0, 1 - age / maxAge);
}

function calculateFieldRelevance(context: AIContext, field: FormField): number {
  if (context.fieldId === field.id) return 1;
  if (context.fieldType === field.type) return 0.8;
  return 0.4;
}

function calculateInteractionRelevance(context: AIContext): number {
  const interactionCount = context.metadata.interactionHistory?.length || 0;
  return Math.min(1, interactionCount / 10); // Max out at 10 interactions
}
