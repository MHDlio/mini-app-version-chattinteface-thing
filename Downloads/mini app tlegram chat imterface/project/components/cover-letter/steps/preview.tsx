'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import type { CoverLetter } from '@/types';

interface PreviewFormProps {
  data: Partial<CoverLetter>;
  onNext: (data: Partial<CoverLetter>) => void;
  language: string;
}

export function PreviewForm({ data, onNext, language }: PreviewFormProps) {
  const { t } = useTranslations();

  const handleComplete = () => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 prose max-w-none dark:prose-invert">
        <div className="mb-8">
          <p className="text-right">{new Date().toLocaleDateString(language)}</p>
        </div>
        
        <div className="mb-8">
          <p>{data.recipientName}</p>
          <p>{data.recipientTitle}</p>
          <p>{data.company}</p>
        </div>

        <div className="whitespace-pre-wrap">
          {data.content}
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.print()}>
          {t('common.download')}
        </Button>
        <Button onClick={handleComplete}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}