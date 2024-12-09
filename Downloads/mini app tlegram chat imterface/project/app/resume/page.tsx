'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { ResumeBuilder } from '@/components/resume/resume-builder';
import { useLanguage } from '@/hooks/use-language';
import { telegram } from '@/lib/telegram';

export default function ResumePage() {
  const { t } = useTranslations();
  const { currentLanguage } = useLanguage();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t('resume.steps.personal'),
      description: t('resume.steps.personalDesc'),
    },
    {
      title: t('resume.steps.education'),
      description: t('resume.steps.educationDesc'),
    },
    {
      title: t('resume.steps.experience'),
      description: t('resume.steps.experienceDesc'),
    },
    {
      title: t('resume.steps.skills'),
      description: t('resume.steps.skillsDesc'),
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
          <h1 className="text-3xl font-bold mb-4">{t('resume.welcome')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('resume.welcomeDesc')}
          </p>
          <Button onClick={handleStart} size="lg">
            {t('resume.getStarted')}
          </Button>
        </Card>
      ) : (
        <ResumeBuilder
          currentStep={step}
          setStep={setStep}
          steps={steps}
          language={currentLanguage}
        />
      )}
    </div>
  );
}