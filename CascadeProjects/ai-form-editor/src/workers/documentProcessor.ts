import { Worker, Job } from 'bullmq';
import redis from '../config/redis';
import { ProcessingJob, JobProgress } from '../types/queue';
import { DocumentService } from '../services/documentService';
import { anonymizeData } from '../utils/anonymize';

class DocumentProcessorWorker {
  private worker: Worker;
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService({
      allowedTypes: ['application/pdf', 'image/*'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      anonymize: true,
      extractFields: true,
    });

    this.worker = new Worker<ProcessingJob>(
      'document-processing',
      async (job) => await this.processDocument(job),
      {
        connection: redis,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 1000,
        },
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed:`, error);
    });

    this.worker.on('error', (error) => {
      console.error('Worker error:', error);
    });
  }

  private async processDocument(job: Job<ProcessingJob>) {
    try {
      // Update progress
      await job.updateProgress({ percentage: 0, stage: 'starting' });

      // Validate job data
      this.validateJobData(job.data);

      // Update progress
      await job.updateProgress({ percentage: 20, stage: 'processing' });

      // Process the document
      const result = await this.documentService.processDocument(job.data.filePath);

      // Update progress
      await job.updateProgress({ percentage: 60, stage: 'analyzing' });

      // Analyze sensitive data if needed
      if (job.data.metadata?.checkSensitiveData) {
        const sensitiveData = await this.documentService.analyzeSensitiveData(result.text);
        result.metadata = {
          ...result.metadata,
          sensitiveDataFound: sensitiveData,
        };
      }

      // Update progress
      await job.updateProgress({ percentage: 80, stage: 'finalizing' });

      // Return the result
      return {
        success: true,
        result,
        processingTime: Date.now() - job.timestamp,
        attempts: job.attemptsMade + 1,
      };
    } catch (error: any) {
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  private validateJobData(data: ProcessingJob) {
    if (!data.documentId) throw new Error('Document ID is required');
    if (!data.filePath) throw new Error('File path is required');
    if (!data.userId) throw new Error('User ID is required');
    if (!data.organizationId) throw new Error('Organization ID is required');
  }

  public async shutdown() {
    await this.worker.close();
  }
}

// Create and export worker instance
const documentProcessorWorker = new DocumentProcessorWorker();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await documentProcessorWorker.shutdown();
  process.exit(0);
});

export default documentProcessorWorker;
