import React, { useState } from 'react';
import { FormEditor } from '@/components/core/FormEditor';
import { AIAssistant } from '@/components/core/AIAssistant';
import { DocumentScanner } from '@/components/core/DocumentScanner';
import { ProcessingIndicator } from '@/components/shared/ProcessingIndicator';
import { ValidationFeedback } from '@/components/shared/ValidationFeedback';
import { DocumentPreview } from '@/components/shared/DocumentPreview';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useFormFields } from '@/hooks/useFormFields';
import { useAIAssistant } from '@/hooks/useAIAssistant';

const FormEditorIntegration = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [rtl, setRtl] = useState(language === 'ar');
  const [scanResult, setScanResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const { fields, updateField } = useFormFields([]);
  const { getAISuggestions } = useAIAssistant();

  const handleScan = async (result: any) => {
    setProcessing(true);
    try {
      // Process scan result
      setScanResult(result);
      
      // Get AI suggestions for fields
      const suggestions = await getAISuggestions(fields);
      suggestions.forEach(s => updateField(s.id, s.value));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ErrorBoundary language={language} rtl={rtl}>
      <div className={`container mx-auto p-4 ${rtl ? 'rtl' : 'ltr'}`}>
        {/* Processing Status */}
        {processing && (
          <ProcessingIndicator
            status="processing"
            language={language}
            rtl={rtl}
          />
        )}

        {/* Document Scanner */}
        <div className="mb-8">
          <DocumentScanner
            onScan={handleScan}
            onError={console.error}
            language={language}
            rtl={rtl}
          />
        </div>

        {/* Document Preview & Form Editor Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scanResult && (
            <div className="lg:sticky lg:top-4">
              <DocumentPreview
                url={scanResult.url}
                highlights={scanResult.highlights}
                language={language}
                rtl={rtl}
              />
            </div>
          )}

          <div>
            <FormEditor
              initialFields={fields}
              onSave={console.log}
              language={language}
              rtl={rtl}
            />

            <ValidationFeedback
              errors={[]}
              warnings={[]}
              language={language}
              rtl={rtl}
            />
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistant
          onSuggestion={console.log}
          language={language}
          rtl={rtl}
        />
      </div>
    </ErrorBoundary>
  );
};

export default FormEditorIntegration;
