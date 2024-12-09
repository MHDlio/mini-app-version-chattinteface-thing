import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Undo2, Redo2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormHistory } from '@/hooks/useFormHistory';
import { useFormFields } from '@/hooks/useFormFields';
import { ValidationFeedback } from '@/components/shared/ValidationFeedback';
import { ProcessingIndicator } from '@/components/shared/ProcessingIndicator';
import type { FormField } from '@/types/form';

interface FormEditorProps {
  initialFields: FormField[];
  onSave?: (fields: FormField[]) => Promise<void>;
  language?: 'en' | 'ar';
  rtl?: boolean;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  initialFields,
  onSave,
  language = 'en',
  rtl = false,
}) => {
  const {
    fields,
    updateFields,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    startBatch,
    endBatch,
    lastSaved,
  } = useFormHistory(initialFields, {
    onAutosave: onSave,
    autosaveInterval: 30000,
  });

  const { validateFields } = useFormFields(fields);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Batch operations
  const handleBatchOperation = useCallback((operation: 'clear' | 'copy' | 'paste') => {
    if (selectedFields.size === 0) return;

    startBatch();
    const updatedFields = [...fields];

    switch (operation) {
      case 'clear':
        selectedFields.forEach(id => {
          const field = updatedFields.find(f => f.id === id);
          if (field) field.value = '';
        });
        break;
      case 'copy':
        // Implementation for copy
        break;
      case 'paste':
        // Implementation for paste
        break;
    }

    endBatch(updatedFields);
    setSelectedFields(new Set());
  }, [fields, selectedFields, startBatch, endBatch]);

  return (
    <div className={`space-y-4 ${rtl ? 'rtl' : 'ltr'}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isSaving ? (
            <ProcessingIndicator
              status="processing"
              message={language === 'en' ? 'Saving...' : 'جارٍ الحفظ...'}
              language={language}
              rtl={rtl}
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              {language === 'en' ? 'Last saved' : 'آخر حفظ'}: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map(field => (
          <motion.div
            key={field.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-2">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium"
              >
                {language === 'en' ? field.label : field.labelAr}
              </label>
              <div className="relative">
                <input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => updateFields(field.id, e.target.value)}
                  className={`
                    w-full
                    ${field.aiAssisted ? 'bg-primary/5' : ''}
                    ${!field.isValid && field.value ? 'border-destructive' : ''}
                    ${rtl ? 'text-right' : 'text-left'}
                  `}
                  dir={rtl ? 'rtl' : 'ltr'}
                  placeholder={language === 'en' ? field.placeholder : field.placeholderAr}
                />
                {field.aiAssisted && (
                  <Wand2 className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50 pointer-events-none" 
                    style={{ [rtl ? 'left' : 'right']: '0.75rem' }}
                  />
                )}
              </div>
              {!field.isValid && field.value && (
                <p className="text-sm text-destructive">
                  {language === 'en' ? field.error : field.errorAr}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Batch Operations */}
      {selectedFields.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 inset-x-4 bg-background border rounded-lg shadow-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {language === 'en' 
                ? `${selectedFields.size} fields selected`
                : `تم تحديد ${selectedFields.size} حقول`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchOperation('clear')}
              >
                {language === 'en' ? 'Clear' : 'مسح'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchOperation('copy')}
              >
                {language === 'en' ? 'Copy' : 'نسخ'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchOperation('paste')}
              >
                {language === 'en' ? 'Paste' : 'لصق'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
