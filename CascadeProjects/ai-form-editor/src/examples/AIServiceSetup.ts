import { RetryableError, NetworkError } from '@/types/errors';
import type { AIConfig, AIResponse, RetryConfig } from '@/types/ai';

export class AIService {
  private config: AIConfig;
  private retryConfig: RetryConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.retryConfig = {
      maxAttempts: config.maxRetries || 3,
      baseDelay: 1000,
      maxDelay: 10000,
    };
  }

  async process(payload: AIProcessPayload): Promise<AIResponse> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.config.endpoint}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      return response.json();
    });
  }

  async suggest(context: AIContext): Promise<AISuggestion[]> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.config.endpoint}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      return response.json();
    });
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof RetryableError &&
        attempt < this.retryConfig.maxAttempts
      ) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
          this.retryConfig.maxDelay
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, attempt + 1);
      }

      throw error;
    }
  }

  private handleError(error: any): Error {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return new RetryableError(error.message, error);
      
      case 'NETWORK_ERROR':
        return new NetworkError(error.message, error);
      
      case 'INVALID_INPUT':
        return new ValidationError(error.message, error);
      
      default:
        return new Error(error.message);
    }
  }

  async train(data: TrainingData): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw this.handleError(error);
    }
  }

  async feedback(feedback: AIFeedback): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      const error = await response.json();
      throw this.handleError(error);
    }
  }
}
