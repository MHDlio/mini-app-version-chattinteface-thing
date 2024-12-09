/**
 * DocumentProcessor Component
 * 
 * A comprehensive document processing component that integrates AI-powered analysis
 * with existing UI components for a seamless document processing experience.
 * 
 * Features:
 * - Document upload and preview
 * - Multi-stage AI processing
 * - Real-time progress tracking
 * - Error handling and recovery
 * - Internationalization support
 * 
 * @component
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { ProcessingIndicator } from '@/components/shared/ProcessingIndicator';
import { DocumentPreview } from '@/components/shared/DocumentPreview';
import { ValidationFeedback } from '@/components/shared/ValidationFeedback';
import { Button } from '@/components/ui/button';
import { ProcessingService, ProcessingResult, ProcessingError, ProcessingProgress } from '../services/ProcessingService';
import { AIService } from '@/services/aiService';

interface DocumentProcessorProps {
  onComplete?: (result: ProcessingResult) => void;
  onError?: (error: ProcessingError) => void;
  language?: 'en' | 'ar';
  rtl?: boolean;
  className?: string;
}

export const DocumentProcessor: React.FC<DocumentProcessorProps> = ({
  onComplete,
  onError,
  language = 'en',
  rtl = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<ProcessingError | null>(null);

  const processingService = new ProcessingService(new AIService());

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    try {
      setStatus('processing');
      setError(null);

      const result = await processingService.processDocument(file, (progress) => {
        setProgress(progress);
      });

      setResult(result);
      setStatus('success');
      onComplete?.(result);
    } catch (error) {
      const processingError = error as ProcessingError;
      setError(processingError);
      setStatus('error');
      onError?.(processingError);
    }
  }, [file, onComplete, onError]);

  const handleRetry = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setProgress(null);
  }, []);

  return (
    <div className={`space-y-6 ${rtl ? 'rtl' : 'ltr'} ${className}`}>
      {/* File Upload */}
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf,image/*"
          className="hidden"
          id="document-upload"
        />
        <label
          htmlFor="document-upload"
          className="cursor-pointer flex items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary"
        >
          <Upload className="w-5 h-5" />
          <span>{t('documentProcessor.upload.label')}</span>
        </label>
      </div>

      {/* Document Preview */}
      {previewUrl && (
        <DocumentPreview
          url={previewUrl}
          language={language}
          rtl={rtl}
        />
      )}

      {/* Processing Status */}
      {status !== 'idle' && (
        <ProcessingIndicator
          status={status}
          progress={progress?.progress}
          message={progress?.message}
          language={language}
          rtl={rtl}
        />
      )}

      {/* Validation Feedback */}
      {result && (
        <ValidationFeedback
          fields={result.fields}
          confidence={result.confidence}
          language={language}
          rtl={rtl}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            {error.message}
          </p>
          {error.details && (
            <pre className="mt-2 text-xs text-destructive/80">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {status === 'error' && (
          <Button
            variant="outline"
            onClick={handleRetry}
          >
            {t('documentProcessor.retry')}
          </Button>
        )}
        {file && status === 'idle' && (
          <Button
            onClick={handleProcess}
          >
            {t('documentProcessor.process')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentProcessor;
