import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FormWizard } from './components/FormEditor/FormWizard';
import './i18n/config';
import './styles/globals.css';

const sections = [
  {
    id: 'personal',
    title: 'Personal Information',
    fields: {
      name: {
        type: 'text',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your full name'
      },
      email: {
        type: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'Enter your email'
      }
    }
  },
  {
    id: 'document',
    title: 'Document Upload',
    fields: {
      documentType: {
        type: 'select',
        label: 'Document Type',
        required: true,
        options: [
          { value: 'invoice', label: 'Invoice' },
          { value: 'receipt', label: 'Receipt' },
          { value: 'contract', label: 'Contract' }
        ]
      }
    }
  }
];

const App: React.FC = () => {
  const handleFormComplete = (data: Record<string, any>) => {
    console.log('Form completed:', data);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <FormWizard
          sections={sections}
          onComplete={handleFormComplete}
          onAIHelp={async (field) => {
            // Placeholder for AI suggestions
            return [
              {
                value: 'Suggested value',
                confidence: 85,
                reason: 'Based on similar forms'
              }
            ];
          }}
        />
      </div>
    </AppLayout>
  );
};

export default App;
