import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingIndicatorProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress?: number;
  message?: string;
  language?: 'en' | 'ar';
  rtl?: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  status,
  progress = 0,
  message,
  language = 'en',
  rtl = false,
}) => {
  const statusIcons = {
    idle: null,
    processing: <Loader2 className="w-5 h-5 animate-spin" />,
    success: <CheckCircle2 className="w-5 h-5 text-primary" />,
    error: <XCircle className="w-5 h-5 text-destructive" />
  };

  const statusMessages = {
    idle: { en: 'Ready', ar: 'جاهز' },
    processing: { en: 'Processing...', ar: 'جارٍ المعالجة...' },
    success: { en: 'Complete', ar: 'مكتمل' },
    error: { en: 'Error', ar: 'خطأ' }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col gap-2 ${rtl ? 'rtl' : 'ltr'}`}
    >
      <div className="flex items-center gap-2">
        {statusIcons[status]}
        <span className="text-sm font-medium">
          {message || statusMessages[status][language]}
        </span>
      </div>
      
      {status === 'processing' && (
        <Progress value={progress} className="h-1" />
      )}
    </motion.div>
  );
};

export default ProcessingIndicator;
