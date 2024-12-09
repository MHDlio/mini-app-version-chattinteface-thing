'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/use-translations';
import { PersonalInfoForm } from './steps/personal-info';
import { EducationForm } from './steps/education';
import { ExperienceForm } from './steps/experience';
import { SkillsForm } from './steps/skills';
import { ResumePreview } from './resume-preview';
import type { Resume } from '@/types';
import { telegram } from '@/lib/telegram';

interface ResumeBuilderProps {
  currentStep: number;
  setStep: (step: number) => void;
  steps: Array<{ title: string; description: string }>;
  language: string;
}

export function ResumeBuilder({
  currentStep,
  setStep,
  steps,
  language,
}: ResumeBuilderProps) {
  const { t } = useTranslations();
  const [resumeData, setResumeData] = useState<Partial<Resume>>({});
  const progress = (currentStep / steps.length) * 100;
  const isLastStep = currentStep === steps.length;

  const handleNext = async (stepData: Partial<Resume>) => {
    setResumeData({ ...resumeData, ...stepData });
    
    if (isLastStep) {
      // Save to Supabase and show completion message
      if (telegram.ready) {
        telegram.showPopup({
          title: t('resume.complete'),
          message: t('resume.completeDesc'),
          buttons: [{ type: 'close', text: t('common.close') }]
        });
      }
    } else {
      setStep(currentStep + 1);
    }
  };

  const StepComponent = {
    1: PersonalInfoForm,
    2: EducationForm,
    3: ExperienceForm,
    4: SkillsForm,
    5: ResumePreview,
  }[currentStep];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('resume.stepProgress', { current: currentStep, total: steps.length })}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {isLastStep ? t('resume.preview') : steps[currentStep - 1].title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isLastStep ? t('resume.previewDesc') : steps[currentStep - 1].description}
        </p>

        {StepComponent && (
          <StepComponent
            data={resumeData}
            onNext={handleNext}
            language={language}
          />
        )}
      </Card>
    </div>
  );
}