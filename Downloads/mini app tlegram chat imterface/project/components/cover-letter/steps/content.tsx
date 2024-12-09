'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import type { CoverLetter } from '@/types';
import { useState } from 'react';

const contentSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters'),
  tone: z.string().min(1, 'Please select a tone'),
});

interface ContentFormProps {
  data: Partial<CoverLetter>;
  onNext: (data: Partial<CoverLetter>) => void;
  language: string;
}

export function ContentForm({ data, onNext, language }: ContentFormProps) {
  const { t } = useTranslations();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      content: data.content || '',
      tone: 'professional',
    },
  });

  const onSubmit = async (values: z.infer<typeof contentSchema>) => {
    onNext({ ...values, language });
  };

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Write a cover letter for ${data.position} position at ${data.company}. 
        The letter should be addressed to ${data.recipientName}, ${data.recipientTitle}.`;
      
      const suggestion = await generateSuggestions(prompt, {
        language,
        tone: form.getValues('tone'),
        industry: 'general',
      });
      
      if (suggestion) {
        form.setValue('content', suggestion);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('letter.steps.form.tone')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
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
              <FormLabel>{t('letter.steps.form.content')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateSuggestion}
            disabled={isGenerating}
          >
            {t('letter.steps.form.suggestions')}
          </Button>
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Form>
  );
}