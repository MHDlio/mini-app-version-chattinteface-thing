'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import type { Resume } from '@/types';

const educationSchema = z.object({
  education: z.array(z.object({
    school: z.string().min(2, 'School name is required'),
    degree: z.string().min(2, 'Degree is required'),
    field: z.string().min(2, 'Field of study is required'),
    startDate: z.string().min(2, 'Start date is required'),
    endDate: z.string().min(2, 'End date is required'),
    description: z.string().optional(),
  })).min(1, 'At least one education entry is required'),
});

interface EducationFormProps {
  data: Partial<Resume>;
  onNext: (data: Partial<Resume>) => void;
  language: string;
}

export function EducationForm({ data, onNext, language }: EducationFormProps) {
  const { t } = useTranslations();
  const form = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      education: data.education || [{
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education"
  });

  const onSubmit = async (values: z.infer<typeof educationSchema>) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`education.${index}.school`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resume.form.school')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resume.form.degree')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`education.${index}.field`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resume.form.field')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`education.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resume.form.startDate')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="month" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`education.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resume.form.endDate')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="month" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`education.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resume.form.description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            description: '',
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('resume.form.addEducation')}
        </Button>

        <div className="flex justify-end">
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Form>
  );
}