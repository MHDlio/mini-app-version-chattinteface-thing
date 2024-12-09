'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Mail, PenTool } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/use-translations';
import { useLanguage } from '@/hooks/use-language';

export default function Home() {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            {t('home.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto ${isRTL ? 'reverse-flex' : ''}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className={`w-8 h-8 text-primary ${isRTL ? 'mirror-icon' : ''}`} />
              </div>
              <h2 className="text-xl font-semibold">{t('home.resumeBuilder')}</h2>
              <p className="text-muted-foreground">
                {t('home.resumeDesc')}
              </p>
              <Link href="/resume" className="mt-4 w-full">
                <Button className="w-full">{t('common.createResume')}</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className={`w-8 h-8 text-primary ${isRTL ? 'mirror-icon' : ''}`} />
              </div>
              <h2 className="text-xl font-semibold">{t('home.coverLetters')}</h2>
              <p className="text-muted-foreground">
                {t('home.coverDesc')}
              </p>
              <Link href="/cover-letter" className="mt-4 w-full">
                <Button className="w-full">{t('common.writeLetter')}</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <PenTool className={`w-8 h-8 text-primary ${isRTL ? 'mirror-icon' : ''}`} />
              </div>
              <h2 className="text-xl font-semibold">{t('home.emailTemplates')}</h2>
              <p className="text-muted-foreground">
                {t('home.emailDesc')}
              </p>
              <Link href="/email" className="mt-4 w-full">
                <Button className="w-full">{t('common.createEmail')}</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {t('common.whyChooseUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">
                {t('home.features.ai')}
              </h3>
              <p>{t('home.features.aiDesc')}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">
                {t('home.features.languages')}
              </h3>
              <p>{t('home.features.langDesc')}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">
                {t('home.features.templates')}
              </h3>
              <p>{t('home.features.templatesDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}