import { APIClient } from '@/services/api';
import { AIService } from '@/services/aiService';
import { AnalyticsService } from '@/services/analytics';
import type { FormPayload, TemplatePayload, AIProcessPayload } from '@/types/api';

export class FormProcessor {
  private api: APIClient;
  private ai: AIService;
  private analytics: AnalyticsService;

  constructor() {
    this.api = new APIClient({
      baseUrl: process.env.API_BASE_URL,
      timeout: 30000,
      retries: 3,
    });

    this.ai = new AIService({
      endpoint: process.env.AI_SERVICE_URL,
      apiKey: process.env.AI_API_KEY,
      maxRetries: 3,
    });

    this.analytics = new AnalyticsService({
      endpoint: process.env.ANALYTICS_URL,
      batchSize: 10,
      flushInterval: 5000,
    });
  }

  async processForm(file: File): Promise<FormPayload> {
    try {
      // Track form processing start
      this.analytics.track('form_processing_start', {
        fileType: file.type,
        fileSize: file.size,
      });

      // 1. Upload document
      const uploadResponse = await this.api.post('/documents', {
        file,
        type: file.type,
      });

      // 2. Process with AI
      const aiPayload: AIProcessPayload = {
        document: {
          content: uploadResponse.data.url,
          type: file.type,
        },
        config: {
          mode: 'form',
          confidence: 0.8,
          language: 'auto',
        },
      };

      const aiResponse = await this.ai.process(aiPayload);

      // 3. Find matching template
      const template = await this.findTemplate(aiResponse.fields);

      // 4. Create form
      const formPayload: FormPayload = {
        fields: aiResponse.fields.map(field => ({
          id: field.id,
          type: field.type,
          value: field.value,
          metadata: {
            confidence: field.confidence,
            suggestions: field.suggestions,
          },
        })),
        metadata: {
          templateId: template?.id,
          version: '1.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          locale: aiResponse.language || 'en',
        },
        validation: template?.validation,
      };

      const form = await this.api.post('/forms', formPayload);

      // Track successful processing
      this.analytics.track('form_processing_complete', {
        formId: form.data.id,
        templateId: template?.id,
        processingTime: Date.now() - startTime,
      });

      return form.data;
    } catch (error) {
      // Track error
      this.analytics.track('form_processing_error', {
        error: error.message,
        code: error.code,
      });

      throw error;
    }
  }

  private async findTemplate(
    fields: Array<{ id: string; type: string; value: string }>
  ): Promise<TemplatePayload | null> {
    // Get all templates
    const templates = await this.api.get('/templates');

    // Find best matching template
    let bestMatch: { template: TemplatePayload; score: number } | null = null;

    for (const template of templates.data) {
      const score = this.calculateTemplateMatch(template, fields);
      
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { template, score };
      }
    }

    return bestMatch && bestMatch.score > 0.8 ? bestMatch.template : null;
  }

  private calculateTemplateMatch(
    template: TemplatePayload,
    fields: Array<{ id: string; type: string; value: string }>
  ): number {
    // Implement template matching logic
    // Return score between 0 and 1
    return 0;
  }
}
