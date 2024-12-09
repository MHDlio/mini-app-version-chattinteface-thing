import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSection, FormField, FormWizardState, FormSubmissionData } from '../types/form';
import { AISuggestion } from '../types/ai';
import { useAIAssistant } from '../contexts/AIAssistantContext';

interface UseFormWizardProps {
  sections: FormSection[];
  initialData?: Record<string, any>;
  onComplete: (data: FormSubmissionData) => Promise<void>;
}

export function useFormWizard({
  sections,
  initialData = {},
  onComplete,
}: UseFormWizardProps) {
  const { t } = useTranslation();
  const { showAssistant, hideAssistant, refreshSuggestions } = useAIAssistant();
  const startTime = useRef(Date.now());
  const validationAttemptsRef = useRef(0);
  const aiStatsRef = useRef({
    suggestionsShown: 0,
    suggestionsApplied: 0,
    fields: new Set<string>(),
  });

  const [state, setState] = useState<FormWizardState>({
    currentSection: 0,
    formData: initialData,
    errors: {},
    aiSuggestions: {},
    isProcessing: false,
    activeField: null,
    completedSections: [],
    validSections: [],
  });

  // Validate a single field
  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
      if (!value && field.validation?.required) {
        return t('form.validation.required');
      }

      if (value && field.validation?.pattern) {
        const pattern = new RegExp(field.validation.pattern);
        if (!pattern.test(value)) {
          return t('form.validation.pattern');
        }
      }

      if (typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return t('form.validation.minLength', { min: field.validation.minLength });
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return t('form.validation.maxLength', { max: field.validation.maxLength });
        }
      }

      if (typeof value === 'number') {
        if (field.validation?.min && value < field.validation.min) {
          return t('form.validation.min', { min: field.validation.min });
        }
        if (field.validation?.max && value > field.validation.max) {
          return t('form.validation.max', { max: field.validation.max });
        }
      }

      if (field.validation?.customValidator) {
        return field.validation.customValidator(value);
      }

      return null;
    },
    [t]
  );

  // Validate the current section
  const validateSection = useCallback(
    (sectionIndex: number) => {
      const section = sections[sectionIndex];
      const newErrors: Record<string, string> = {};
      validationAttemptsRef.current++;

      // Field-level validation
      Object.entries(section.fields).forEach(([fieldId, field]) => {
        const error = validateField(field, state.formData[fieldId]);
        if (error) {
          newErrors[fieldId] = error;
        }
      });

      // Section-level validation
      if (section.validation) {
        const sectionErrors = section.validation(state.formData);
        Object.assign(newErrors, sectionErrors);
      }

      setState((prev) => ({
        ...prev,
        errors: newErrors,
        validSections: Object.keys(newErrors).length === 0
          ? [...prev.validSections, sectionIndex]
          : prev.validSections.filter((s) => s !== sectionIndex),
      }));

      return Object.keys(newErrors).length === 0;
    },
    [sections, state.formData, validateField]
  );

  // Handle field changes
  const handleFieldChange = useCallback(
    async (fieldId: string, value: any) => {
      const section = sections[state.currentSection];
      const field = section.fields[fieldId];

      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [fieldId]: value },
        errors: { ...prev.errors, [fieldId]: validateField(field, value) },
      }));

      // Request AI suggestions if field is AI-enabled
      if (field.aiEnabled) {
        try {
          const suggestions = await refreshSuggestions(fieldId);
          aiStatsRef.current.suggestionsShown++;
          aiStatsRef.current.fields.add(fieldId);
          
          setState((prev) => ({
            ...prev,
            aiSuggestions: { ...prev.aiSuggestions, [fieldId]: suggestions },
          }));
        } catch (error) {
          console.error('Failed to get AI suggestions:', error);
        }
      }
    },
    [sections, state.currentSection, validateField, refreshSuggestions]
  );

  // Navigate to next section
  const handleNext = useCallback(async () => {
    if (validateSection(state.currentSection)) {
      if (state.currentSection < sections.length - 1) {
        setState((prev) => ({
          ...prev,
          currentSection: prev.currentSection + 1,
          completedSections: [...prev.completedSections, prev.currentSection],
        }));
      } else {
        // Form completion
        setState((prev) => ({ ...prev, isProcessing: true }));
        try {
          const submissionData: FormSubmissionData = {
            formData: state.formData,
            metadata: {
              completedAt: new Date().toISOString(),
              duration: Date.now() - startTime.current,
              aiAssistance: {
                suggestionsShown: aiStatsRef.current.suggestionsShown,
                suggestionsApplied: aiStatsRef.current.suggestionsApplied,
                fields: Array.from(aiStatsRef.current.fields),
              },
              validationAttempts: validationAttemptsRef.current,
            },
          };
          await onComplete(submissionData);
        } finally {
          setState((prev) => ({ ...prev, isProcessing: false }));
        }
      }
    }
  }, [sections, state.currentSection, state.formData, validateSection, onComplete]);

  // Navigate to previous section
  const handleBack = useCallback(() => {
    if (state.currentSection > 0) {
      setState((prev) => ({
        ...prev,
        currentSection: prev.currentSection - 1,
      }));
    }
  }, [state.currentSection]);

  // Apply AI suggestion
  const applySuggestion = useCallback((fieldId: string, suggestion: AISuggestion) => {
    handleFieldChange(fieldId, suggestion.value);
    aiStatsRef.current.suggestionsApplied++;
  }, [handleFieldChange]);

  // Focus field
  const handleFieldFocus = useCallback(
    (fieldId: string, event: React.FocusEvent) => {
      const field = sections[state.currentSection].fields[fieldId];
      if (field.aiEnabled) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        showAssistant(fieldId, {
          x: rect.right + 10,
          y: rect.top,
        });
      }
      setState((prev) => ({ ...prev, activeField: fieldId }));
    },
    [sections, state.currentSection, showAssistant]
  );

  // Blur field
  const handleFieldBlur = useCallback(() => {
    setState((prev) => ({ ...prev, activeField: null }));
    hideAssistant();
  }, [hideAssistant]);

  // Validate current section when form data changes
  useEffect(() => {
    validateSection(state.currentSection);
  }, [state.formData, state.currentSection, validateSection]);

  return {
    state,
    handleFieldChange,
    handleFieldFocus,
    handleFieldBlur,
    handleNext,
    handleBack,
    applySuggestion,
    validateSection,
    validateField,
  };
}
