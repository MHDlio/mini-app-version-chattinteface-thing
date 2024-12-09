/**
 * @keywords AI Context, Form Assistance, Smart Suggestions, State Management
 * 
 * Context Features:
 * • Real-time AI suggestions with ML
 * • Context-aware field assistance
 * • Document processing integration
 * •
 * Limited context history size (50 entries)
Added context history cleanup
 User feedback tracking
 * • Continuous learning
 * • Personalized suggestions
 * Added null checks for critical operations
Better type handling in callbacks
 * State Management:
 * • Position tracking for suggestions
 * • Loading and error states
 * • Feedback collection
 * • Field context preservation
 * • Context history tracking
 * • Model performance metrics
 */&&//Request Management:
//Added AbortController to cancel pending requests
//Implemented request debouncing (300ms) for suggestions
//Proper cleanup of requests on unmount
//Error Handling:
//Added input validation for critical parameters
//Implemented value rollback on failed suggestion applications
//Better error state management in reducer
//Proper AbortError handling

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { AIAssistantState, AIAssistantContextType, AISuggestion, AIContext, AIModelResponse } from '../types/ai';
import { FormField, FormSection } from '../types/form';
import { getAISuggestions, sendAIFeedback, getAIHelpContext } from '../services/aiService';
import { useToast } from '../hooks/useToast';
import { debounce } from '../utils/debounce';

const MAX_CONTEXT_HISTORY = 50; // Limit context history size
const SUGGESTION_DEBOUNCE_MS = 300; // Debounce suggestions refresh

const initialState: AIAssistantState = {
  isVisible: false,
  position: null,
  suggestions: [],
  loading: false,
  error: null,
  activeField: null,
  activeSection: null,
  feedbackInProgress: new Set<string>(),
  contextHistory: [],
};

type Action =
  | { type: 'SHOW_ASSISTANT'; payload: { fieldId: string; sectionId: string; position: { x: number; y: number }; context?: AIContext } }
  | { type: 'HIDE_ASSISTANT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUGGESTIONS'; payload: AISuggestion[] }
  | { type: 'START_FEEDBACK'; payload: string }
  | { type: 'END_FEEDBACK'; payload: string }
  | { type: 'UPDATE_SUGGESTION'; payload: { id: string; helpful: boolean } }
  | { type: 'ADD_CONTEXT'; payload: AIContext }
  | { type: 'UPDATE_CONTEXT_HISTORY'; payload: AIContext[] }
  | { type: 'CLEAR_CONTEXT_HISTORY' };

function reducer(state: AIAssistantState, action: Action): AIAssistantState {
  switch (action.type) {
    case 'SHOW_ASSISTANT':
      return {
        ...state,
        isVisible: true,
        position: action.payload.position,
        activeField: action.payload.fieldId,
        activeSection: action.payload.sectionId,
        error: null, // Clear any previous errors
        contextHistory: action.payload.context 
          ? [...state.contextHistory.slice(-MAX_CONTEXT_HISTORY), action.payload.context]
          : state.contextHistory,
      };
    case 'HIDE_ASSISTANT':
      return {
        ...state,
        isVisible: false,
        position: null,
        activeField: null,
        activeSection: null,
        suggestions: [], // Clear suggestions when hiding
        error: null, // Clear any errors
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error, // Clear error when starting to load
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false, // Ensure loading is false when error occurs
      };
    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: action.payload,
        loading: false,
        error: null,
      };
    case 'START_FEEDBACK':
      return {
        ...state,
        feedbackInProgress: new Set([...state.feedbackInProgress, action.payload]),
      };
    case 'END_FEEDBACK': {
      const newFeedbackInProgress = new Set(state.feedbackInProgress);
      newFeedbackInProgress.delete(action.payload);
      return {
        ...state,
        feedbackInProgress: newFeedbackInProgress,
      };
    }
    case 'UPDATE_SUGGESTION':
      return {
        ...state,
        suggestions: state.suggestions.map((s) =>
          s.id === action.payload.id
            ? { ...s, metadata: { ...s.metadata, userFeedback: action.payload.helpful } }
            : s
        ),
      };
    case 'ADD_CONTEXT':
      return {
        ...state,
        contextHistory: [...state.contextHistory.slice(-MAX_CONTEXT_HISTORY), action.payload],
      };
    case 'UPDATE_CONTEXT_HISTORY':
      return {
        ...state,
        contextHistory: action.payload.slice(-MAX_CONTEXT_HISTORY),
      };
    case 'CLEAR_CONTEXT_HISTORY':
      return {
        ...state,
        contextHistory: [],
      };
    default:
      return state;
  }
}

const AIAssistantContext = createContext<AIAssistantContextType | null>(null);

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToast } = useToast();
  const contextHistoryRef = useRef<AIContext[]>([]);
  const activeRequestRef = useRef<AbortController | null>(null);

  // Keep context history in ref for performance
  useEffect(() => {
    contextHistoryRef.current = state.contextHistory;
  }, [state.contextHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  const showAssistant = useCallback(
    async (fieldId: string, position: { x: number; y: number }, context?: AIContext) => {
      try {
        if (!fieldId) throw new Error('Field ID is required');
        
        dispatch({ 
          type: 'SHOW_ASSISTANT', 
          payload: { 
            fieldId, 
            sectionId: state.activeSection || '', 
            position, 
            context 
          } 
        });

        if (context) {
          dispatch({ type: 'ADD_CONTEXT', payload: context });
        }
      } catch (error) {
        console.error('Error showing assistant:', error);
        showToast('error', 'Failed to show AI assistant');
      }
    },
    [state.activeSection, showToast]
  );

  const hideAssistant = useCallback(() => {
    activeRequestRef.current?.abort(); // Cancel any pending requests
    dispatch({ type: 'HIDE_ASSISTANT' });
  }, []);

  const debouncedRefresh = useCallback(
    debounce(async (fieldId: string, context?: AIContext) => {
      try {
        // Cancel any pending requests
        activeRequestRef.current?.abort();
        const abortController = new AbortController();
        activeRequestRef.current = abortController;

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const field = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!field) throw new Error('Field not found');

        const suggestions = await getAISuggestions(
          field as unknown as FormField,
          (field as HTMLInputElement).value,
          { id: state.activeSection || '', title: '', type: 'form' } as FormSection,
          context,
          abortController.signal
        );

        if (!abortController.signal.aborted) {
          dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        console.error('Error refreshing suggestions:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to get suggestions' });
        showToast('error', 'Failed to get AI suggestions');
      } finally {
        if (activeRequestRef.current === abortController) {
          activeRequestRef.current = null;
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    }, SUGGESTION_DEBOUNCE_MS),
    [state.activeSection, showToast]
  );

  const refreshSuggestions = useCallback(
    async (fieldId: string, context?: AIContext) => {
      if (!fieldId) return;
      await debouncedRefresh(fieldId, context);
    },
    [debouncedRefresh]
  );

  const applySuggestion = useCallback(
    async (suggestion: AISuggestion) => {
      try {
        if (!state.activeField) throw new Error('No active field');
        
        const field = document.querySelector(
          `[data-field-id="${state.activeField}"]`
        ) as HTMLInputElement;
        if (!field) throw new Error('Field not found');

        // Store previous value for potential rollback
        const previousValue = field.value;

        try {
          field.value = suggestion.value;
          field.dispatchEvent(new Event('input', { bubbles: true }));

          const context = await getAIHelpContext(
            field as unknown as FormField,
            { id: state.activeSection || '', title: '', type: 'form' } as FormSection
          );
          
          dispatch({ type: 'ADD_CONTEXT', payload: context });
          hideAssistant();
        } catch (error) {
          // Rollback on error
          field.value = previousValue;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          throw error;
        }
      } catch (error) {
        console.error('Error applying suggestion:', error);
        showToast('error', 'Failed to apply suggestion');
      }
    },
    [state.activeField, state.activeSection, hideAssistant, showToast]
  );

  const provideFeedback = useCallback(
    async (suggestionId: string, helpful: boolean, context?: AIContext) => {
      if (!suggestionId || !state.activeField || state.feedbackInProgress.has(suggestionId)) return;
      
      try {
        dispatch({ type: 'START_FEEDBACK', payload: suggestionId });

        await sendAIFeedback(suggestionId, helpful, state.activeField, context);
        dispatch({ type: 'UPDATE_SUGGESTION', payload: { id: suggestionId, helpful } });

        showToast('success', 'Thank you for your feedback!');
      } catch (error) {
        console.error('Error providing feedback:', error);
        showToast('error', 'Failed to submit feedback');
      } finally {
        dispatch({ type: 'END_FEEDBACK', payload: suggestionId });
      }
    },
    [state.activeField, state.feedbackInProgress, showToast]
  );

  const updateContext = useCallback((context: AIContext) => {
    if (!context) return;
    dispatch({ type: 'ADD_CONTEXT', payload: context });
  }, []);

  const clearContextHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_CONTEXT_HISTORY' });
  }, []);

  const value = {
    state,
    showAssistant,
    hideAssistant,
    applySuggestion,
    refreshSuggestions,
    provideFeedback,
    updateContext,
    clearContextHistory,
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}
