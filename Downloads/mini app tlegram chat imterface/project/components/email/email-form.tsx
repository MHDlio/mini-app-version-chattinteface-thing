'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import { generateSuggestions } from '@/lib/openai';
import { getSmartSuggestions } from '@/lib/prompts';
import type { EmailTemplate } from '@/types';
import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const emailSchema = z.object({
  title: z.string().optional(),
  subject: z.string().optional(),
  content: z.string(),
  tone: z.string().min(1, 'Please select a tone'),
});

interface EmailFormProps {
  data: Partial<EmailTemplate>;
  onNext: (data: Partial<EmailTemplate>) => void;
  onBack: () => void;
  language: string;
}

export function EmailForm({ data, onNext, onBack, language }: EmailFormProps) {
  const { t } = useTranslations();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions] = useState(() => getSmartSuggestions(language, data.category));
  
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      title: data.title || '',
      subject: '',
      content: data.content || '',
      tone: 'formal',
    },
  });

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    onNext({ ...data, ...values });
  };

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    try {
      const { tone, content, subject } = form.getValues();
      
      if (!content) {
        form.setError('content', { message: t('email.form.contentRequired') });
        return;
      }
      
      const prompt = `
Type: ${data.category} email
Subject: ${subject || ''}
Content:
${content}

Please convert this into proper German business communication, maintaining the original intent but following German standards.`;
      
      const suggestion = await generateSuggestions(prompt, {
        language,
        tone: tone as 'professional' | 'casual' | 'confident',
        industry: 'business',
      });
      
      if (suggestion) {
        const [germanSubject, ...contentParts] = suggestion.split('\n');
        if (germanSubject.startsWith('Betreff:')) {
          form.setValue('subject', germanSubject.replace('Betreff:', '').trim(), { shouldValidate: true });
        }
        form.setValue('content', contentParts.join('\n').trim(), { shouldValidate: true });
      } else {
        form.setError('content', { message: t('email.form.generationFailed') });
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      form.setError('content', { 
        message: error instanceof Error ? error.message : t('email.form.generationFailed') 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">{t('email.createEmail')}</h2>
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.form.subject')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('email.form.optional')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.form.tone')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('email.form.selectTone')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="formal">{t('email.form.formal')}</SelectItem>
                  <SelectItem value="casual">{t('email.form.casual')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t('email.form.content')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[200px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t('email.form.suggestions')}
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    const content = form.getValues('content');
                    form.setValue('content', content ? `${content}\n${suggestion}` : suggestion);
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateSuggestion}
            disabled={isGenerating}
          >
            {t('email.form.generate')}
          </Button>
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Form>
  );
}