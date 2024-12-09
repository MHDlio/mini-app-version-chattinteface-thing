'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { useLanguage } from '@/hooks/use-language';
import { Share2, Download, Send } from 'lucide-react';
import type { EmailTemplate } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf';
import { useToast } from '@/components/ui/use-toast';
import { useTelegram } from '@/hooks/use-telegram';
import { useEffect } from 'react';

interface EmailPreviewProps {
  data: Partial<EmailTemplate>;
  onBack: () => void;
  onNext: (data: Partial<EmailTemplate>) => void;
  language: string;
}

export function EmailPreview({ data, onBack, onNext, language }: EmailPreviewProps) {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { 
    isReady: isTelegramReady, 
    shareData, 
    hapticFeedback, 
    mainButton,
    showConfirm,
    showAlert,
    platform 
  } = useTelegram();

  useEffect(() => {
    if (isTelegramReady) {
      mainButton.show(t('common.next'));
      mainButton.onClick(() => handleComplete());
      return () => mainButton.hide();
    }
  }, [isTelegramReady]);

  const handleComplete = async () => {
    hapticFeedback.impact('light');
    const confirmed = await showConfirm(t('email.confirmSend'));
    if (confirmed) {
      hapticFeedback.success();
      onNext(data);
    } else {
      hapticFeedback.warning();
    }
  };

  const handleShare = async () => {
    hapticFeedback.selection();
    const emailContent = `${t('email.form.subject')}: ${data.subject}\n\n${data.content}`;
    
    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.subject,
          text: emailContent,
        });
        hapticFeedback.success();
        return;
      } catch (error) {
        // Fall back to mailto
      }
    }
    
    // Fallback to mailto
    const mailtoLink = `mailto:?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.content)}`;
    window.location.href = mailtoLink;
  };

  const handleDownload = async () => {
    try {
      hapticFeedback.impact('medium');
      mainButton.showProgress();
      await exportToPDF('email-content', `email-${Date.now()}.pdf`);
      hapticFeedback.success();
      toast({
        title: t('common.success'),
        description: t('common.downloadComplete'),
      });
    } catch (error) {
      hapticFeedback.error();
      toast({
        title: t('common.error'),
        description: t('common.downloadError'),
        variant: 'destructive',
      });
    } finally {
      mainButton.hideProgress();
    }
  };

  const handleTelegramShare = async () => {
    hapticFeedback.selection();
    const success = await shareData({
      type: 'email',
      content: {
        subject: data.subject,
        body: data.content,
        language,
        platform,
        timestamp: Date.now(),
      },
    });

    if (success) {
      hapticFeedback.success();
    } else {
      hapticFeedback.error();
      await showAlert(t('common.telegramNotAvailable'));
    }
  };

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            hapticFeedback.impact('light');
            onBack();
          }}
        >
          <ArrowIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">{t('email.preview')}</h2>
      </div>

      <Card 
        id="email-content" 
        className="p-6 prose max-w-none dark:prose-invert"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color, inherit)',
          color: 'var(--tg-theme-text-color, inherit)'
        }}
      >
        <div className="space-y-4">
          <div>
            <p className="flex items-center gap-2">
              <strong>{t('email.form.subject')}:</strong>
              <span>{data.subject}</span>
            </p>
          </div>

          <div className={`whitespace-pre-wrap text-${isRTL ? 'right' : 'left'}`}>
            {data.content}
          </div>
        </div>
      </Card>

      {!isTelegramReady && (
        <div className={`flex flex-wrap gap-4 justify-${isRTL ? 'start' : 'end'}`}>
          <Button 
            variant="outline" 
            onClick={handleShare}
            onMouseDown={() => hapticFeedback.impact('light')}
          >
            <Share2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.share')}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            onMouseDown={() => hapticFeedback.impact('light')}
          >
            <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.download')}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTelegramShare}
            onMouseDown={() => hapticFeedback.impact('light')}
          >
            <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.telegram')}
          </Button>
          <Button 
            onClick={handleComplete}
            onMouseDown={() => hapticFeedback.impact('light')}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
}