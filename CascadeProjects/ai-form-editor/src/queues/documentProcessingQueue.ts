import { Queue, QueueScheduler } from 'bullmq';
import redis from '../config/redis';
import { ProcessingJob, JobProgress } from '../types/queue';

// Queue for document processing
export const documentQueue = new Queue<ProcessingJob, any, string>('document-processing', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// Queue scheduler for handling delayed jobs and retries
export const scheduler = new QueueScheduler('document-processing', {
  connection: redis,
});

// Queue events
documentQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

documentQueue.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

documentQueue.on('progress', (job, progress: JobProgress) => {
  console.log(`Job ${job.id} progress:`, progress);
});

// Helper functions
export async function addDocumentJob(job: ProcessingJob) {
  return documentQueue.add('process-document', job, {
    priority: job.priority || 0,
    jobId: job.documentId,
  });
}

export async function getJobStatus(jobId: string) {
  const job = await documentQueue.getJob(jobId);
  if (!job) return null;
  
  const state = await job.getState();
  const progress = await job.progress();
  
  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    attemptsMade: job.attemptsMade,
  };
}

export async function pauseProcessing() {
  await documentQueue.pause();
}

export async function resumeProcessing() {
  await documentQueue.resume();
}

export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    documentQueue.getWaitingCount(),
    documentQueue.getActiveCount(),
    documentQueue.getCompletedCount(),
    documentQueue.getFailedCount(),
    documentQueue.getDelayedCount(),
  ]);

  const isPaused = await documentQueue.isPaused();

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused: isPaused,
  };
}
