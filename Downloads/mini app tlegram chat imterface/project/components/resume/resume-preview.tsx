'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import type { Resume } from '@/types';
import { ArrowLeft, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface ResumePreviewProps {
  data: Partial<Resume>;
  onBack: () => void;
  onNext: (data: Partial<Resume>) => void;
  language: string;
}

export function ResumePreview({ data, onBack, onNext, language }: ResumePreviewProps) {
  const { t } = useTranslations();
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleComplete = () => {
    onNext(data);
  };

  const exportToPDF = async () => {
    if (!resumeRef.current) return;

    const canvas = await html2canvas(resumeRef.current);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('resume.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">{t('resume.preview')}</h2>
        </div>
        <Button onClick={exportToPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('common.download')}
        </Button>
      </div>

      <Card className="p-6" ref={resumeRef}>
        <div className="flex items-start gap-6">
          {data.personalInfo?.photo && (
            <img 
              src={data.personalInfo.photo} 
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{data.personalInfo?.fullName}</h1>
            <div className="text-muted-foreground space-y-1">
              <p>{data.personalInfo?.email}</p>
              <p>{data.personalInfo?.phone}</p>
              <p>{data.personalInfo?.location}</p>
              {data.personalInfo?.linkedin && (
                <p>
                  <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline">
                    LinkedIn
                  </a>
                </p>
              )}
              {data.personalInfo?.website && (
                <p>
                  <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer"
                     className="text-primary hover:underline">
                    Portfolio
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {data.education && data.education.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('resume.steps.education')}</h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium">{edu.school}</h3>
                  <p>{edu.degree} - {edu.field}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.endDate}
                  </p>
                  {edu.description && (
                    <p className="mt-2 text-sm">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('resume.steps.experience')}</h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium">{exp.position}</h3>
                  <p>{exp.company} - {exp.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.endDate}
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('resume.steps.skills')}</h2>
            <div className="space-y-4">
              {data.skills.map((skillGroup, index) => (
                <div key={index}>
                  <h3 className="font-medium mb-2">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-secondary px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleComplete}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}