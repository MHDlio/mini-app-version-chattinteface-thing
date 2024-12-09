import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import type { FormSection, FormSubmissionData, FormField } from '../../types/form';
import { useFormWizard } from '../../hooks/useFormWizard';
import { cn } from '../../utils/cn';

interface FormWizardProps {
  sections: FormSection[];
  onComplete: (data: FormSubmissionData) => Promise<void>;
  initialData?: Record<string, any>;
  className?: string;
}

const FormWizard: React.FC<FormWizardProps> = ({
  sections,
  onComplete,
  initialData,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const {
    state,
    handleFieldChange,
    handleFieldFocus,
    handleFieldBlur,
    handleNext,
    handleBack,
    applySuggestion,
  } = useFormWizard({
    sections,
    initialData,
    onComplete,
  });

  useEffect(() => {
    validateSection(state.currentSection);
  }, [state.formData, state.currentSection]);

  const validateSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const newErrors: Record<string, string> = {};

    Object.entries(section.fields).forEach(([fieldId, field]) => {
      if (field.required && !state.formData[fieldId]) {
        newErrors[fieldId] = t('form.validation.required');
      }
    });

    state.setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const currentSection = sections[state.currentSection];
  const isRTL = i18n.dir() === 'rtl';

  const renderField = (fieldId: string, field: FormField) => {
    const value = state.formData[fieldId] || '';
    const error = state.errors[fieldId];
    const suggestions = state.aiSuggestions[fieldId] || [];
    const isActive = state.activeField === fieldId;

    return (
      <div key={fieldId} className="form-field-container">
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium mb-1',
            error ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'
          )}
        >
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>

        {field.helpText && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {field.helpText}
          </p>
        )}

        <div className="relative">
          {field.type === 'textarea' ? (
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              onFocus={(e) => handleFieldFocus(fieldId, e)}
              onBlur={handleFieldBlur}
              className={cn(
                'form-textarea w-full rounded-md shadow-sm',
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
                isRTL ? 'text-right' : 'text-left'
              )}
              placeholder={field.placeholder}
              rows={4}
              dir={isRTL ? 'rtl' : 'ltr'}
              aria-invalid={!!error}
              aria-describedby={error ? `${fieldId}-error` : undefined}
            />
          ) : field.type === 'select' ? (
            <select
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              onFocus={(e) => handleFieldFocus(fieldId, e)}
              onBlur={handleFieldBlur}
              className={cn(
                'form-select w-full rounded-md shadow-sm',
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
                isRTL ? 'text-right' : 'text-left'
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
              aria-invalid={!!error}
              aria-describedby={error ? `${fieldId}-error` : undefined}
            >
              <option value="">{t('common.select')}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={fieldId}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              onFocus={(e) => handleFieldFocus(fieldId, e)}
              onBlur={handleFieldBlur}
              className={cn(
                'form-input w-full rounded-md shadow-sm',
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
                isRTL ? 'text-right' : 'text-left'
              )}
              placeholder={field.placeholder}
              dir={isRTL ? 'rtl' : 'ltr'}
              aria-invalid={!!error}
              aria-describedby={error ? `${fieldId}-error` : undefined}
            />
          )}

          {error && (
            <div
              id={`${fieldId}-error`}
              className="flex items-center space-x-1 mt-1 text-red-500"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {field.aiEnabled && suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('form.ai.suggestions')}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(fieldId, suggestion)}
                    className={cn(
                      'inline-flex items-center space-x-1 text-sm',
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                      'px-2 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40',
                      'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
                    )}
                    aria-label={t('form.ai.applySuggestion', { value: suggestion.value })}
                  >
                    <span>{suggestion.value}</span>
                    <span className="text-blue-500 dark:text-blue-400">
                      {suggestion.confidence}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Progress Steps */}
      <nav
        className="wizard-steps"
        role="tablist"
        aria-label={t('form.sections')}
      >
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            <div
              className={cn(
                'wizard-step',
                index <= state.currentSection && 'wizard-step-active',
                state.completedSections.includes(index) && 'wizard-step-completed'
              )}
              role="tab"
              aria-selected={index === state.currentSection}
              aria-controls={`section-${index}`}
              tabIndex={index === state.currentSection ? 0 : -1}
            >
              <div className="wizard-step-number">
                {state.completedSections.includes(index) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="wizard-step-title">{section.title}</span>
            </div>
            {index < sections.length - 1 && (
              <div className="wizard-step-connector" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Current Section */}
      <section
        id={`section-${state.currentSection}`}
        role="tabpanel"
        aria-labelledby={`step-${state.currentSection}`}
        className="space-y-6"
      >
        {currentSection.description && (
          <p className="text-gray-500 dark:text-gray-400">
            {currentSection.description}
          </p>
        )}

        <div className="space-y-4">
          {Object.entries(currentSection.fields).map(([fieldId, field]) =>
            renderField(fieldId, field)
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={handleBack}
            disabled={state.currentSection === 0}
            className={cn(
              'btn btn-ghost',
              state.currentSection === 0 && 'invisible'
            )}
          >
            {t('common.back')}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={state.isProcessing}
            className="btn btn-primary"
          >
            {state.isProcessing ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>{t('common.processing')}</span>
              </span>
            ) : state.currentSection === sections.length - 1 ? (
              t('common.submit')
            ) : (
              <span className="flex items-center space-x-2">
                <span>{t('common.next')}</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default FormWizard;
