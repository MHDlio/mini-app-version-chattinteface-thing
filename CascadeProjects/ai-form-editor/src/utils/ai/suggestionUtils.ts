import { AISuggestion, AIContext } from '../../types/ai';
import { FormField } from '../../types/form';
import { calculateContextRelevance } from './contextUtils';

export function rankSuggestions(
  suggestions: AISuggestion[],
  field: FormField,
  context?: AIContext
): AISuggestion[] {
  return suggestions
    .map(suggestion => ({
      ...suggestion,
      metadata: {
        ...suggestion.metadata,
        suggestionRank: calculateSuggestionRank(suggestion, field, context),
      },
    }))
    .sort((a, b) => {
      const rankA = a.metadata.suggestionRank || 0;
      const rankB = b.metadata.suggestionRank || 0;
      return rankB - rankA;
    });
}

function calculateSuggestionRank(
  suggestion: AISuggestion,
  field: FormField,
  context?: AIContext
): number {
  const confidenceScore = suggestion.confidence;
  const contextScore = context ? calculateContextRelevance(context, field) : 0.5;
  const feedbackScore = calculateFeedbackScore(suggestion);
  
  // Weighted average of scores
  return (
    confidenceScore * 0.4 +
    contextScore * 0.4 +
    feedbackScore * 0.2
  );
}

function calculateFeedbackScore(suggestion: AISuggestion): number {
  if (suggestion.metadata.userFeedback === undefined) {
    return 0.5; // Neutral score for no feedback
  }
  return suggestion.metadata.userFeedback ? 1 : 0;
}

export function filterInvalidSuggestions(
  suggestions: AISuggestion[],
  field: FormField
): AISuggestion[] {
  return suggestions.filter(suggestion => {
    // Basic validation
    if (!suggestion.value) return false;
    
    // Type validation
    if (!validateSuggestionType(suggestion.value, field.type)) return false;
    
    // Field-specific validation
    if (field.validation) {
      return field.validation.every(rule => rule.validator(suggestion.value));
    }
    
    return true;
  });
}

function validateSuggestionType(value: any, fieldType: string): boolean {
  switch (fieldType) {
    case 'number':
      return typeof value === 'number' || !isNaN(Number(value));
    case 'date':
      return !isNaN(Date.parse(value));
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false';
    default:
      return true;
  }
}

export function deduplicateSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
  const seen = new Set<string>();
  return suggestions.filter(suggestion => {
    const key = JSON.stringify(suggestion.value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
