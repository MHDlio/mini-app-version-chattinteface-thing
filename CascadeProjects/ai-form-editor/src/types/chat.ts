export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: Date;
  feedback?: {
    helpful?: boolean;
    submitted: boolean;
  };
  context?: Record<string, any>;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  lastContext?: Record<string, any>;
}

export interface ChatContextValue {
  state: ChatState;
  sendMessage: (message: string, context?: Record<string, any>) => Promise<void>;
  clearMessages: () => void;
  provideFeedback: (messageId: string, helpful: boolean) => Promise<void>;
}

export interface ChatUIConfig {
  showTimestamp: boolean;
  showFeedback: boolean;
  maxMessages?: number;
  suggestionLimit?: number;
  typingIndicatorDelay?: number;
}
