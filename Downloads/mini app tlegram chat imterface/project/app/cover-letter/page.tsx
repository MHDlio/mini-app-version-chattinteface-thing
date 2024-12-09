'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { CoverLetterBuilder } from '@/components/cover-letter/cover-letter-builder';
import { useLanguage } from '@/hooks/use-language';
import { telegram } from '@/lib/telegram';

export default function CoverLetterPage() {
  const { t } = useTranslations();
  const { currentLanguage } = useLanguage();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t('letter.steps.basics'),
      description: t('letter.steps.basicsDesc'),
    },
    {
      title: t('letter.steps.content'),
      description: t('letter.steps.contentDesc'),
    },
    {
      title: t('letter.steps.preview'),
      description: t('letter.steps.previewDesc'),
    },
  ];

  const handleStart = () => {
    setStep(1);
    if (telegram.ready) {
      telegram.expand();
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {step === 0 ? (
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">{t('letter.welcome')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('letter.welcomeDesc')}
          </p>
          <Button onClick={handleStart} size="lg">
            {t('letter.getStarted')}
          </Button>
        </Card>
      ) : (
        <CoverLetterBuilder
          currentStep={step}
          setStep={setStep}
          steps={steps}
          language={currentLanguage}
        />
      )}
    </div>
  );
}