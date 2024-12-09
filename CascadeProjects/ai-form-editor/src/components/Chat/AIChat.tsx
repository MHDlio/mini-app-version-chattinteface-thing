import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Loader2, ThumbsUp, ThumbsDown, Copy, Trash2, RefreshCw } from 'lucide-react';
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import { useToast } from '../../hooks/useToast';
import { useChat } from '../../hooks/useChat';
import { cn } from '../../utils/cn';
import { ChatUIConfig, Message } from '../../types/chat';
import { formatChatDate } from '../../services/chatService';

interface AIChatProps {
  onSendMessage: (message: string) => Promise<string>;
  suggestions?: string[];
  className?: string;
  contextData?: Record<string, any>;
  config?: ChatUIConfig;
}

const MessageActions = memo(({ message, onCopy, onDelete, onRetry }: {
  message: Message;
  onCopy: () => void;
  onDelete: () => void;
  onRetry: () => void;
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onCopy}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        aria-label={t('chat.actions.copy')}
      >
        <Copy size={14} />
      </button>
      <button
        onClick={onDelete}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        aria-label={t('chat.actions.delete')}
      >
        <Trash2 size={14} />
      </button>
      {message.role === 'user' && (
        <button
          onClick={onRetry}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label={t('chat.actions.retry')}
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
});

MessageActions.displayName = 'MessageActions';

const AIChat: React.FC<AIChatProps> = ({
  onSendMessage,
  suggestions = [],
  className = '',
  contextData = {},
  config = {
    showTimestamp: true,
    showFeedback: true,
    maxMessages: 100,
    suggestionLimit: 3,
    typingIndicatorDelay: 500,
  },
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { provideFeedback } = useAIAssistant();
  const {
    state,
    sendMessage,
    clearMessages,
    rowVirtualizer,
    parentRef,
  } = useChat(config);

  const handleSend = async (input: string) => {
    try {
      await sendMessage(input, contextData);
    } catch (error) {
      showToast({
        title: t('chat.error.title'),
        description: t('chat.error.description'),
        type: 'error',
      });
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast({
        title: t('chat.actions.copy'),
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: t('chat.error.title'),
        description: t('chat.error.description'),
        type: 'error',
      });
    }
  };

  const handleDelete = (messageId: string) => {
    // Implementation for message deletion
  };

  const handleRetry = (message: Message) => {
    handleSend(message.content);
  };

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div 
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg',
        className
      )} 
      role="region" 
      aria-label={t('chat.title')}
    >
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const message = state.messages[virtualItem.index];
          return (
            <div
              key={message.id}
              className={cn(
                'chat-message mb-4 group',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div
                className={cn(
                  'flex items-start space-x-2',
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'user' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  {message.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-gray-700 dark:text-gray-300" />
                  )}
                </div>
                <div
                  className={cn(
                    'chat-message-content max-w-[80%] group',
                    message.role === 'user' ? 'chat-message-user' : 'chat-message-ai'
                  )}
                  dir={i18n.dir()}
                  aria-live="polite"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {message.role === 'user' ? t('chat.you') : t('chat.assistant')}
                      </span>
                      {config.showTimestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatChatDate(message.timestamp, i18n.language)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      {message.role === 'ai' && config.showFeedback && !message.feedback?.submitted && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => provideFeedback(message.id, true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            aria-label={t('chat.feedback.helpful')}
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => provideFeedback(message.id, false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            aria-label={t('chat.feedback.notHelpful')}
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      )}
                      <MessageActions
                        message={message}
                        onCopy={() => handleCopy(message.content)}
                        onDelete={() => handleDelete(message.id)}
                        onRetry={() => handleRetry(message)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {state.isTyping && (
          <div className="chat-message mb-4">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot size={16} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div className="chat-message-content chat-message-ai" aria-live="polite">
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">{t('chat.typing')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('chat.suggestions.title')}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, config.suggestionLimit).map((suggestion, index) => (
              <button
                key={index}
                className={cn(
                  'text-sm py-1 px-2 rounded-md',
                  'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
                  'transition-colors duration-200'
                )}
                onClick={() => handleSend(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input border-t dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <textarea
            value={state.input}
            onChange={(e) => state.setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(state.input);
              }
            }}
            placeholder={t('chat.placeholder')}
            className={cn(
              'flex-1 min-h-[40px] max-h-[120px] resize-none rounded-lg',
              'border border-gray-300 dark:border-gray-600',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'dark:bg-gray-700 dark:text-white'
            )}
            rows={1}
            dir={i18n.dir()}
            aria-label={t('chat.input')}
          />
          <button
            onClick={() => handleSend(state.input)}
            disabled={!state.input?.trim() || state.isTyping}
            className={cn(
              'p-2 h-10 rounded-lg',
              'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300',
              'text-white transition-colors duration-200',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            aria-label={t('chat.send')}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AIChat);
