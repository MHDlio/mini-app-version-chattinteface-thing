import { useCallback, useEffect, useRef } from 'react';
import { AISuggestion, AIContext } from '../../types/ai';
import { FormField, FormSection } from '../../types/form';
import { useToast } from '../shared/useToast';
import { createAIContext, mergeContexts } from '../../utils/ai/contextUtils';
import { rankSuggestions, filterInvalidSuggestions, deduplicateSuggestions } from '../../utils/ai/suggestionUtils';
import { MAX_CONTEXT_HISTORY, SUGGESTION_DEBOUNCE_MS } from '../../constants/ai';

export function useAIAssistant() {
  const { showToast } = useToast();
  const activeRequestRef = useRef<AbortController | null>(null);
  const contextHistoryRef = useRef<AIContext[]>([]);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  const getSuggestions = useCallback(async (
    field: FormField,
    value: any,
    section: FormSection
  ): Promise<AISuggestion[]> => {
    try {
      // Cancel any pending requests
      activeRequestRef.current?.abort();
      const abortController = new AbortController();
      activeRequestRef.current = abortController;

      // Create context
      const context = createAIContext(
        field,
        value,
        section,
        contextHistoryRef.current[contextHistoryRef.current.length - 1]
      );

      // Get suggestions
      const suggestions = await getAISuggestions(field, value, section, context, abortController.signal);

      // Process suggestions
      const validSuggestions = filterInvalidSuggestions(suggestions, field);
      const uniqueSuggestions = deduplicateSuggestions(validSuggestions);
      const rankedSuggestions = rankSuggestions(uniqueSuggestions, field, context);

      // Update context history
      contextHistoryRef.current = [
        ...contextHistoryRef.current.slice(-MAX_CONTEXT_HISTORY),
        context
      ];

      return rankedSuggestions;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Error getting suggestions:', error);
      showToast('error', 'Failed to get AI suggestions');
      return [];
    } finally {
      activeRequestRef.current = null;
    }
  }, [showToast]);

  const provideFeedback = useCallback(async (
    suggestion: AISuggestion,
    helpful: boolean,
    field: FormField
  ): Promise<void> => {
    try {
      const context = contextHistoryRef.current[contextHistoryRef.current.length - 1];
      await sendAIFeedback(suggestion.id, helpful, field.id, context);
      
      showToast('success', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error providing feedback:', error);
      showToast('error', 'Failed to submit feedback');
    }
  }, [showToast]);

  const clearContext = useCallback(() => {
    contextHistoryRef.current = [];
  }, []);

  return {
    getSuggestions,
    provideFeedback,
    clearContext,
  };
}
