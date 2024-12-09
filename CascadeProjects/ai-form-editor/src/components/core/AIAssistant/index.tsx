import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, User, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onSuggestion?: (suggestion: string) => void;
  language?: 'en' | 'ar';
  rtl?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onSuggestion,
  language = 'en',
  rtl = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // TODO: Implement actual AI service call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'This is a mock AI response. Replace with actual AI integration.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      onSuggestion?.(assistantMessage.content);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`fixed bottom-4 ${rtl ? 'left-4' : 'right-4'} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4"
          >
            <Card className="w-[320px] shadow-lg">
              {/* Header */}
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  {language === 'en' ? 'AI Assistant' : 'المساعد الذكي'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[300px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-lg p-2
                          ${message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                          }
                        `}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'Type your message...'
                        : 'اكتب رسالتك...'
                    }
                    className="min-h-[40px] max-h-[120px]"
                    dir={rtl ? 'rtl' : 'ltr'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
};

export default AIAssistant;
