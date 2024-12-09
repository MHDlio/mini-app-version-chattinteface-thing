/**
 * @keywords Document Processing, OCR, PDF, Form Fields, AI Extraction
 * 
 * Key Features:
 * • Document text extraction from PDFs and images
 * • Automatic form field detection
 * • Confidence scoring for extracted data
 * • Metadata tracking and anonymization
 */

import { FormField } from './form';

export interface DocumentProcessingResult {
  text: string;
  type: 'pdf' | 'image';
  confidence?: number;
  pages?: number;
  fields?: Record<string, FormField>;
  metadata?: {
    fileName: string;
    fileSize: number;
    processedAt: string;
    anonymized: boolean;
  };
}

export interface DocumentProcessorConfig {
  allowedTypes: string[];
  maxFileSize: number;
  ocrLanguage?: string;
  anonymize: boolean;
  extractFields: boolean;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  type: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
