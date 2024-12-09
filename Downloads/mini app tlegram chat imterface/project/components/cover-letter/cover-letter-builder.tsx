'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/use-translations';
import { BasicInfoForm } from './steps/basic-info';
import { ContentForm } from './steps/content';
import { PreviewForm } from './steps/preview';
import type { CoverLetter } from '@/types';
import { telegram } from '@/lib/telegram';

interface CoverLetterBuilderProps {
  currentStep: number;
  setStep: (step: number) => void;
  steps: Array<{ title: string; description: string }>;
  language: string;
}

export function CoverLetterBuilder({
  currentStep,
  setStep,
  steps,
  language,
}: CoverLetterBuilderProps) {
  const { t } = useTranslations();
  const [letterData, setLetterData] = useState<Partial<CoverLetter>>({});
  const progress = (currentStep / steps.length) * 100;

  const handleNext = async (stepData: Partial<CoverLetter>) => {
    setLetterData({ ...letterData, ...stepData });
    
    if (currentStep === steps.length) {
      if (telegram.ready) {
        telegram.showPopup({
          title: t('letter.complete'),
          message: t('letter.completeDesc'),
          buttons: [{ type: 'close', text: t('common.close') }]
        });
      }
    } else {
      setStep(currentStep + 1);
    }
  };

  const StepComponent = {
    1: BasicInfoForm,
    2: ContentForm,
    3: PreviewForm,
  }[currentStep];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('letter.stepProgress', { current: currentStep, total: steps.length })}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {steps[currentStep - 1].description}
        </p>

        {StepComponent && (
          <StepComponent
            data={letterData}
            onNext={handleNext}
            language={language}
          />
        )}
      </Card>
    </div>
  );
}