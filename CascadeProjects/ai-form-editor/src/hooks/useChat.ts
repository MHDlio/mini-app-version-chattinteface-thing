import { useCallback, useReducer, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Message, ChatState, ChatUIConfig } from '../types/chat';
import { sendChatMessage, validateMessage } from '../services/chatService';
import { useToast } from './useToast';
import { useVirtualizer } from '@tanstack/react-virtual';

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_FEEDBACK'; payload: { id: string; helpful: boolean } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_CONTEXT'; payload: Record<string, any> };

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  error: null,
  lastContext: undefined,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isTyping: false,
      };
    case 'UPDATE_FEEDBACK':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? {
                ...msg,
                feedback: {
                  helpful: action.payload.helpful,
                  submitted: true,
                },
              }
            : msg
        ),
      };
    case 'CLEAR_MESSAGES':
      return {
        ...initialState,
      };
    case 'SET_CONTEXT':
      return {
        ...state,
        lastContext: action.payload,
      };
    default:
      return state;
  }
}

export function useChat(config: ChatUIConfig = {
  showTimestamp: true,
  showFeedback: true,
  maxMessages: 100,
  suggestionLimit: 3,
  typingIndicatorDelay: 500,
}) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { t } = useTranslation();
  const { showToast } = useToast();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: state.messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimate each message height
    overscan: 5, // Number of items to render outside of the visible area
  });

  const sendMessage = useCallback(
    async (message: string, context?: Record<string, any>) => {
      if (!message.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date(),
        context,
      };

      if (!validateMessage(userMessage)) {
        showToast({
          title: t('chat.error.invalidMessage'),
          type: 'error',
        });
        return;
      }

      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_TYPING', payload: true });

      if (context) {
        dispatch({ type: 'SET_CONTEXT', payload: context });
      }

      try {
        const response = await sendChatMessage(
          message,
          context || state.lastContext
        );

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.message,
          role: 'ai',
          timestamp: new Date(),
          context: response.context,
          feedback: { submitted: false },
        };

        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });

        if (response.context) {
          dispatch({ type: 'SET_CONTEXT', payload: response.context });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Unknown error',
        });
        showToast({
          title: t('chat.error.failed'),
          description: error instanceof Error ? error.message : undefined,
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }
    },
    [state.lastContext, showToast, t]
  );

  const provideFeedback = useCallback(
    async (messageId: string, helpful: boolean) => {
      dispatch({ type: 'UPDATE_FEEDBACK', payload: { id: messageId, helpful } });
    },
    []
  );

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  return {
    state,
    sendMessage,
    provideFeedback,
    clearMessages,
    rowVirtualizer,
    parentRef,
  };
}
