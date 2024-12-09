/**
 * Document Processing Feature
 * 
 * This feature provides AI-powered document processing capabilities,
 * including document analysis, field extraction, and form mapping.
 * 
 * @module
 */

export { DocumentProcessor } from './components/DocumentProcessor';
export { ProcessingService } from './services/ProcessingService';
export type {
  ProcessingResult,
  ProcessingError,
  ProcessingProgress
} from './services/ProcessingService';
