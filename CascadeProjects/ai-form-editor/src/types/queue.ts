import { DocumentProcessingResult } from './document';

export interface ProcessingJob {
  documentId: string;
  filePath: string;
  userId: string;
  organizationId: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface JobResult {
  success: boolean;
  result?: DocumentProcessingResult;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  processingTime: number;
  attempts: number;
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';

export interface JobProgress {
  percentage: number;
  stage: string;
  details?: string;
}
