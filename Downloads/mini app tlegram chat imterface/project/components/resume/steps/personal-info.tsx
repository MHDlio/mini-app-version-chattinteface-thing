'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from '@/hooks/use-translations';
import type { Resume } from '@/types';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  photo: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

interface PersonalInfoFormProps {
  data: Partial<Resume>;
  onNext: (data: Partial<Resume>) => void;
  language: string;
}

export function PersonalInfoForm({ data, onNext, language }: PersonalInfoFormProps) {
  const { t } = useTranslations();
  const [photoPreview, setPhotoPreview] = useState<string>(data.personalInfo?.photo || '');

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: data.personalInfo?.fullName || '',
      email: data.personalInfo?.email || '',
      photo: data.personalInfo?.photo || '',
      phone: data.personalInfo?.phone || '',
      location: data.personalInfo?.location || '',
      linkedin: '',
      website: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    onNext({ personalInfo: values });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        form.setValue('photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="w-32 h-32">
            {photoPreview ? (
              <AvatarImage src={photoPreview} alt="Profile photo" />
            ) : (
              <AvatarFallback>
                <User className="w-16 h-16" />
              </AvatarFallback>
            )}
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="max-w-[200px]"
          />
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('resume.form.fullName')}</FormLabel>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resume.form.email')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resume.form.phone')}</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('resume.form.location')}</FormLabel>
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
            name="linkedin"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>{t('resume.form.linkedin')}</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>{t('resume.form.website')}</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    type="url"
                    placeholder="https://example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">{t('common.next')}</Button>
        </div>
      </form>
    </Form>
  );
}