'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { EmailForm } from './email-form';
import { EmailPreview } from './email-preview';
import type { EmailTemplate } from '@/types';
import { telegram } from '@/lib/telegram';

interface EmailBuilderProps {
  category: string;
  onBack: () => void;
  language: string;
}

export function EmailBuilder({ category, onBack, language }: EmailBuilderProps) {
  const { t } = useTranslations();
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [emailData, setEmailData] = useState<Partial<EmailTemplate>>({
    category,
    language,
  });

  const handleNext = async (data: Partial<EmailTemplate>) => {
    if (step === 'form') {
      setEmailData({ ...emailData, ...data });
      setStep('preview');
    } else {
      if (telegram.ready) {
        telegram.showPopup({
          title: t('email.complete'),
          message: t('email.completeDesc'),
          buttons: [{ type: 'close', text: t('common.close') }]
        });
      }
      onBack();
    }
  };

  return (
    <Card className="p-6">
      {step === 'form' ? (
        <EmailForm
          data={emailData}
          onNext={handleNext}
          onBack={onBack}
          language={language}
        />
      ) : (
        <EmailPreview
          data={emailData}
          onBack={() => setStep('form')}
          onNext={handleNext}
          language={language}
        />
      )}
    </Card>
  );
}