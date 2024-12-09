import React, { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import { AISuggestion, AIContext } from '../../types/ai';
import { 
  ThumbUpIcon, 
  ThumbDownIcon, 
  XIcon, 
  SparklesIcon, 
  RefreshIcon,
  BrainCircuitIcon 
} from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    state: { 
      isVisible, 
      position, 
      suggestions, 
      loading, 
      error, 
      activeField,
      activeSection,
      contextHistory,
      feedbackInProgress 
    },
    applySuggestion,
    refreshSuggestions,
    provideFeedback,
    updateContext,
  } = useAIAssistant();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastContextRef = useRef<AIContext | null>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Update context when field changes
  useEffect(() => {
    if (activeField && activeSection) {
      const newContext: AIContext = {
        fieldId: activeField,
        fieldType: 'text', // Get actual field type
        sectionId: activeSection,
        timestamp: new Date().toISOString(),
      };
      
      if (JSON.stringify(newContext) !== JSON.stringify(lastContextRef.current)) {
        lastContextRef.current = newContext;
        updateContext(newContext);
      }
    }
  }, [activeField, activeSection, updateContext]);

  const handleSuggestionClick = useCallback(async (suggestion: AISuggestion) => {
    if (!activeField) return;
    
    const context: AIContext = {
      fieldId: activeField,
      fieldType: 'text', // Get actual field type
      sectionId: activeSection || undefined,
      timestamp: new Date().toISOString(),
      metadata: {
        suggestionId: suggestion.id,
        confidence: suggestion.confidence,
      },
    };
    
    await applySuggestion(suggestion);
    updateContext(context);
  }, [activeField, activeSection, applySuggestion, updateContext]);

  const handleRefresh = useCallback(async () => {
    if (!activeField) return;
    
    const context: AIContext = {
      fieldId: activeField,
      fieldType: 'text', // Get actual field type
      sectionId: activeSection || undefined,
      timestamp: new Date().toISOString(),
    };
    
    await refreshSuggestions(activeField, context);
  }, [activeField, activeSection, refreshSuggestions]);

  const handleFeedback = useCallback(async (suggestionId: string, helpful: boolean) => {
    if (!activeField || feedbackInProgress.has(suggestionId)) return;
    
    const context: AIContext = {
      fieldId: activeField,
      fieldType: 'text', // Get actual field type
      sectionId: activeSection || undefined,
      timestamp: new Date().toISOString(),
      metadata: {
        suggestionId,
        feedbackType: helpful ? 'positive' : 'negative',
      },
    };
    
    await provideFeedback(suggestionId, helpful, context);
  }, [activeField, activeSection, feedbackInProgress, provideFeedback]);

  if (!isVisible || !position) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-80 max-h-[80vh] overflow-auto rounded-lg border bg-background shadow-lg"
      style={{
        top: position.y,
        left: position.x,
      }}
      role="dialog"
      aria-label={t('aiAssistant.label')}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">{t('aiAssistant.title')}</h2>
          {contextHistory.length > 0 && (
            <BrainCircuitIcon 
              className="h-4 w-4 text-success" 
              title={t('aiAssistant.contextActive')}
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="rounded-full p-1 hover:bg-accent"
            disabled={loading}
            aria-label={t('aiAssistant.refresh')}
          >
            <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-accent"
            aria-label={t('common.close')}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {error && (
          <div className="mb-3 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm">{t('common.loading')}</span>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('aiAssistant.noSuggestions')}
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group relative rounded-md border p-3 hover:bg-accent transition-colors"
              >
                {/* Suggestion content */}
                <div
                  className="cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSuggestionClick(suggestion);
                    }
                  }}
                >
                  <p className="text-sm">{suggestion.value}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t('aiAssistant.confidence')}: {(suggestion.confidence * 100).toFixed(0)}%
                    </span>
                    <span>{suggestion.source}</span>
                  </div>
                </div>

                {/* Feedback buttons */}
                <div className="absolute right-2 top-2 hidden space-x-1 group-hover:flex">
                  <button
                    onClick={() => handleFeedback(suggestion.id, true)}
                    className="rounded p-1 hover:bg-background"
                    aria-label={t('aiAssistant.helpful')}
                    disabled={feedbackInProgress.has(suggestion.id)}
                  >
                    <ThumbUpIcon className={`h-4 w-4 ${
                      suggestion.metadata?.userFeedback === true ? 'text-success' : ''
                    }`} />
                  </button>
                  <button
                    onClick={() => handleFeedback(suggestion.id, false)}
                    className="rounded p-1 hover:bg-background"
                    aria-label={t('aiAssistant.notHelpful')}
                    disabled={feedbackInProgress.has(suggestion.id)}
                  >
                    <ThumbDownIcon className={`h-4 w-4 ${
                      suggestion.metadata?.userFeedback === false ? 'text-destructive' : ''
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
