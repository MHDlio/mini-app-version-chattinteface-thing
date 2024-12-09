'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { EmailBuilder } from '@/components/email/email-builder';
import { useLanguage } from '@/hooks/use-language';
import { telegram } from '@/lib/telegram';
import { Mail, FileText, Building } from 'lucide-react';

export default function EmailPage() {
  const { t } = useTranslations();
  const { currentLanguage, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'contract',
      icon: FileText,
      title: t('email.categories.contract.title'),
      description: t('email.categories.contract.desc'),
    },
    {
      id: 'application',
      icon: Mail,
      title: t('email.categories.application.title'),
      description: t('email.categories.application.desc'),
    },
    {
      id: 'inquiry',
      icon: Building,
      title: t('email.categories.inquiry.title'),
      description: t('email.categories.inquiry.desc'),
    },
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (telegram.ready) {
      telegram.expand();
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {!selectedCategory ? (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            {t('email.welcome')}
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            {t('email.welcomeDesc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className={`w-8 h-8 text-primary ${isRTL ? 'mirror-icon' : ''}`} />
                    </div>
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <EmailBuilder
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          language={currentLanguage}
        />
      )}
    </div>
  );
}