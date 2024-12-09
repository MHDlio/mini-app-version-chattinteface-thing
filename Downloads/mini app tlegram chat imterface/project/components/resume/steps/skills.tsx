'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import type { Resume } from '@/types';

const skillsSchema = z.object({
  skills: z.array(z.object({
    category: z.string().min(2, 'Category is required'),
    items: z.array(z.string()).min(1, 'At least one skill is required'),
  })).min(1, 'At least one skill category is required'),
});

interface SkillsFormProps {
  data: Partial<Resume>;
  onNext: (data: Partial<Resume>) => void;
  language: string;
}

export function SkillsForm({ data, onNext, language }: SkillsFormProps) {
  const { t } = useTranslations();
  const form = useForm<z.infer<typeof skillsSchema>>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: data.skills || [{
        category: '',
        items: [''],
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills"
  });

  const onSubmit = async (values: z.infer<typeof skillsSchema>) => {
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

            <FormField
              control={form.control}
              name={`skills.${index}.category`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resume.form.skillCategory')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {form.watch(`skills.${index}.items`).map((_, itemIndex) => (
                <div key={itemIndex} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`skills.${index}.items.${itemIndex}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder={t('resume.form.skillPlaceholder')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {itemIndex > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const items = form.getValues(`skills.${index}.items`);
                        form.setValue(
                          `skills.${index}.items`,
                          items.filter((_, i) => i !== itemIndex)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const items = form.getValues(`skills.${index}.items`);
                form.setValue(`skills.${index}.items`, [...items, '']);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('resume.form.addSkill')}
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ category: '', items: [''] })}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('resume.form.addCategory')}
        </Button>

        <div className="flex justify-end">
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Form>
  );
}