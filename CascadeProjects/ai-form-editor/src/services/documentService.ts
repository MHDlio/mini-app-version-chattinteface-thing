/**
 * @keywords Document Processing, OCR, PDF Parsing, Field Extraction, AI Processing
 * 
 * Core Capabilities:
 * • Intelligent document parsing and text extraction
 * • OCR processing for images using Tesseract
 * • PDF text and structure analysis
 * • Automatic form field detection
 * • Privacy-preserving data handling
 * 
 * Processing Pipeline:
 * 1. File validation and type detection
 * 2. Text extraction (OCR/PDF)
 * 3. Field identification and extraction
 * 4. Data anonymization (optional)
 * 5. Metadata generation
 */

import { DocumentProcessingResult, DocumentProcessorConfig, ExtractedField } from '../types/document';
import { FormField } from '../types/form';
import { anonymizeData, detectSensitiveData } from '../utils/anonymize';
import Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export class DocumentService {
  private config: DocumentProcessorConfig;

  constructor(config: DocumentProcessorConfig) {
    this.config = config;
  }

  async processDocument(file: File): Promise<DocumentProcessingResult> {
    this.validateFile(file);

    const result: DocumentProcessingResult = {
      text: '',
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        processedAt: new Date().toISOString(),
        anonymized: this.config.anonymize,
      },
    };

    if (file.type.startsWith('image/')) {
      const ocrResult = await this.processImage(file);
      result.text = ocrResult.text;
      result.confidence = ocrResult.confidence;
    } else if (file.type === 'application/pdf') {
      result.text = await this.processPDF(file);
      result.pages = await this.getPDFPageCount(file);
    }

    if (this.config.anonymize) {
      result.text = anonymizeData(result.text);
    }

    if (this.config.extractFields) {
      result.fields = await this.extractFields(result.text);
    }

    return result;
  }

  private validateFile(file: File): void {
    if (!this.config.allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
    }
  }

  private async processImage(file: File): Promise<{ text: string; confidence: number }> {
    const result = await Tesseract.recognize(
      file,
      this.config.ocrLanguage || 'eng',
      {
        logger: m => console.log(m),
      }
    );

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  }

  private async processPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  private async getPDFPageCount(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  }

  private async extractFields(text: string): Promise<Record<string, FormField>> {
    // This is a placeholder implementation. In a real application,
    // you would use AI/ML to identify form fields from the text.
    const fields: Record<string, FormField> = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const labelMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (labelMatch) {
        const [, label, value] = labelMatch;
        const id = label.toLowerCase().replace(/\s+/g, '_');
        
        fields[id] = {
          id,
          type: 'text',
          label: label.trim(),
          defaultValue: value.trim(),
          aiEnabled: true,
          aiContext: `Extracted from document: ${label}`,
        };
      }
    }

    return fields;
  }

  public async analyzeSensitiveData(text: string): Promise<{ type: string; count: number }[]> {
    return detectSensitiveData(text);
  }
}
