'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from '@/hooks/use-translations';
import type { CoverLetter } from '@/types';

const basicInfoSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientTitle: z.string().min(2, 'Recipient title is required'),
  company: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position is required'),
});

interface BasicInfoFormProps {
  data: Partial<CoverLetter>;
  onNext: (data: Partial<CoverLetter>) => void;
  language: string;
}

export function BasicInfoForm({ data, onNext, language }: BasicInfoFormProps) {
  const { t } = useTranslations();
  const form = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      recipientName: '',
      recipientTitle: '',
      company: '',
      position: '',
      ...data,
    },
  });

  const onSubmit = async (values: z.infer<typeof basicInfoSchema>) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="recipientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('letter.steps.form.recipientName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipientTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('letter.steps.form.recipientTitle')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('letter.steps.form.company')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('letter.steps.form.jobTitle')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Form>
  );
}