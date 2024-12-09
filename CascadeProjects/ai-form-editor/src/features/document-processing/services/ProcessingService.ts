/**
 * ProcessingService
 * 
 * Provides document processing capabilities using AI services.
 * Handles document analysis, field extraction, and validation.
 */

import { AIService } from '@/services/aiService';

export interface ProcessingResult {
  fields: Record<string, any>;
  confidence: number;
  metadata: {
    processingTime: number;
    documentType: string;
    pageCount: number;
  };
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: any;
}

export interface ProcessingProgress {
  stage: 'analysis' | 'extraction' | 'mapping' | 'validation';
  progress: number;
  message?: string;
}

export class ProcessingService {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Process a document file through the AI pipeline
   * @param file Document file to process
   * @param onProgress Callback for progress updates
   * @returns Processing result with extracted fields
   */
  async processDocument(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<ProcessingResult> {
    try {
      // Stage 1: Document Analysis
      onProgress?.({
        stage: 'analysis',
        progress: 0,
        message: 'Analyzing document structure...'
      });
      
      const analysisResult = await this.analyzeDocument(file);
      
      onProgress?.({
        stage: 'analysis',
        progress: 100,
        message: 'Document analysis complete'
      });

      // Stage 2: Field Extraction
      onProgress?.({
        stage: 'extraction',
        progress: 0,
        message: 'Extracting form fields...'
      });
      
      const extractionResult = await this.extractFields(analysisResult);
      
      onProgress?.({
        stage: 'extraction',
        progress: 100,
        message: 'Field extraction complete'
      });

      // Stage 3: Field Mapping
      onProgress?.({
        stage: 'mapping',
        progress: 0,
        message: 'Mapping fields to schema...'
      });
      
      const mappingResult = await this.mapFields(extractionResult);
      
      onProgress?.({
        stage: 'mapping',
        progress: 100,
        message: 'Field mapping complete'
      });

      // Stage 4: Validation
      onProgress?.({
        stage: 'validation',
        progress: 0,
        message: 'Validating extracted data...'
      });
      
      const validationResult = await this.validateData(mappingResult);
      
      onProgress?.({
        stage: 'validation',
        progress: 100,
        message: 'Validation complete'
      });

      return this.createProcessingResult(validationResult);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async analyzeDocument(file: File) {
    const base64Data = await this.fileToBase64(file);
    return this.aiService.analyzeDocument(base64Data);
  }

  private async extractFields(analysisResult: any) {
    return this.aiService.extractFields(analysisResult);
  }

  private async mapFields(extractionResult: any) {
    return this.aiService.mapFields(extractionResult);
  }

  private async validateData(mappingResult: any) {
    return this.aiService.validateFields(mappingResult);
  }

  private createProcessingResult(data: any): ProcessingResult {
    return {
      fields: data.fields,
      confidence: data.confidence || 0,
      metadata: {
        processingTime: data.processingTime || 0,
        documentType: data.documentType || 'unknown',
        pageCount: data.pageCount || 1
      }
    };
  }

  private handleError(error: any): ProcessingError {
    return {
      code: error.code || 'PROCESSING_ERROR',
      message: error.message || 'An error occurred during document processing',
      details: error
    };
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
