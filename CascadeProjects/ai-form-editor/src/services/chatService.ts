import DOMPurify from 'dompurify';
import { Message } from '../types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ChatResponse {
  message: string;
  context?: Record<string, any>;
  error?: string;
}

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  });
};

export const sendChatMessage = async (
  message: string,
  context?: Record<string, any>,
  authToken?: string
): Promise<ChatResponse> => {
  try {
    const sanitizedMessage = sanitizeInput(message);
    
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        message: sanitizedMessage,
        context,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    const data = await response.json();
    return {
      message: sanitizeInput(data.message),
      context: data.context,
    };
  } catch (error) {
    console.error('Chat service error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to communicate with AI service');
  }
};

export const validateMessage = (message: Message): boolean => {
  if (!message.content || typeof message.content !== 'string') {
    return false;
  }
  if (!message.id || typeof message.id !== 'string') {
    return false;
  }
  if (!message.timestamp || !(message.timestamp instanceof Date)) {
    return false;
  }
  if (message.role !== 'user' && message.role !== 'ai') {
    return false;
  }
  return true;
};

export const formatChatDate = (date: Date, locale: string): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date)}`;
  } else {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }
};
