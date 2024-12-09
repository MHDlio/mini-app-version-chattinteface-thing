import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface ValidationError {
  field: string;
  message: string;
  messageAr?: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  messageAr?: string;
}

interface ValidationFeedbackProps {
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  language?: 'en' | 'ar';
  rtl?: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  errors = [],
  warnings = [],
  language = 'en',
  rtl = false,
}) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className={`space-y-2 ${rtl ? 'rtl' : 'ltr'}`}>
      <AnimatePresence>
        {errors.map((error, index) => (
          <motion.div
            key={`error-${index}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {language === 'en' ? error.message : error.messageAr}
              </span>
            </Alert>
          </motion.div>
        ))}

        {warnings.map((warning, index) => (
          <motion.div
            key={`warning-${index}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="warning" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                {language === 'en' ? warning.message : warning.messageAr}
              </span>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ValidationFeedback;
