export const MAX_CONTEXT_HISTORY = 50;
export const SUGGESTION_DEBOUNCE_MS = 300;
export const AI_MODEL_CONFIG = {
  endpoint: `${process.env.NEXT_PUBLIC_API_URL || ''}/api/ai/model`,
  version: '1.0.0',
  parameters: {
    temperature: 0.7,
    maxTokens: 100,
    topK: 5,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
  },
  features: {
    contextLearning: true,
    feedbackProcessing: true,
    realTimeSuggestions: true,
    batchProcessing: true,
  },
};
