# Document Processing Examples

## Basic Usage

### Simple Document Processing
```tsx
import { DocumentProcessor } from '@/features/document-processing';

function SimpleDocumentProcessor() {
  const handleComplete = (result) => {
    console.log('Processing complete:', result);
  };

  return (
    <DocumentProcessor
      onComplete={handleComplete}
      language="en"
    />
  );
}
```

### Custom Styled Processor
```tsx
import { DocumentProcessor } from '@/features/document-processing';

function CustomStyledProcessor() {
  return (
    <DocumentProcessor
      className="max-w-2xl mx-auto bg-slate-50 p-6 rounded-xl shadow-lg"
      language="en"
    />
  );
}
```

### With Error Handling
```tsx
import { DocumentProcessor, ProcessingError } from '@/features/document-processing';

function ProcessorWithErrorHandling() {
  const handleError = (error: ProcessingError) => {
    console.error('Processing failed:', error);
    // Implement custom error handling
    if (error.code === 'INVALID_FILE_TYPE') {
      // Handle invalid file type
    }
  };

  return (
    <DocumentProcessor
      onError={handleError}
      language="en"
    />
  );
}
```

## Advanced Usage

### Custom Processing Service
```tsx
import { DocumentProcessor, ProcessingService } from '@/features/document-processing';
import { CustomAIService } from './services/CustomAIService';

function CustomProcessor() {
  // Create custom processing service
  const customService = new ProcessingService(new CustomAIService());

  return (
    <DocumentProcessor
      processingService={customService}
      language="en"
    />
  );
}
```

### Integration with Form System
```tsx
import { DocumentProcessor, ProcessingResult } from '@/features/document-processing';
import { useForm } from 'your-form-library';

function FormIntegration() {
  const form = useForm();

  const handleProcessingComplete = (result: ProcessingResult) => {
    // Map extracted fields to form
    Object.entries(result.fields).forEach(([fieldName, value]) => {
      form.setValue(fieldName, value);
    });
  };

  return (
    <div className="space-y-8">
      <DocumentProcessor
        onComplete={handleProcessingComplete}
        language="en"
      />
      <form.Form>
        {/* Your form fields */}
      </form.Form>
    </div>
  );
}
```

### With Progress Tracking
```tsx
import { DocumentProcessor, ProcessingProgress } from '@/features/document-processing';

function ProcessorWithProgress() {
  const [currentStage, setCurrentStage] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState<number>(0);

  const handleProgress = (progress: ProcessingProgress) => {
    setCurrentStage(progress.stage);
    setOverallProgress(progress.progress);
    
    // Custom progress tracking
    analytics.trackProgress({
      stage: progress.stage,
      progress: progress.progress,
      timestamp: new Date()
    });
  };

  return (
    <div>
      <DocumentProcessor
        onProgress={handleProgress}
        language="en"
      />
      <ProgressDisplay
        stage={currentStage}
        progress={overallProgress}
      />
    </div>
  );
}
```

### Multilingual Support
```tsx
import { DocumentProcessor } from '@/features/document-processing';
import { useLanguage } from './hooks/useLanguage';

function MultilingualProcessor() {
  const { language, direction } = useLanguage();

  return (
    <DocumentProcessor
      language={language}
      rtl={direction === 'rtl'}
      className={direction === 'rtl' ? 'font-arabic' : 'font-latin'}
    />
  );
}
```

## Best Practices

### 1. Error Handling
Always implement proper error handling:
```tsx
<DocumentProcessor
  onError={(error) => {
    logger.error('Document processing failed', error);
    notifyUser(error.message);
    if (error.code === 'RETRY_NEEDED') {
      scheduleRetry();
    }
  }}
/>
```

### 2. Progress Tracking
Track progress for better UX:
```tsx
<DocumentProcessor
  onProgress={(progress) => {
    updateLoadingIndicator(progress);
    if (progress.stage === 'analysis') {
      showAnalysisMessage();
    }
  }}
/>
```

### 3. Validation Integration
Integrate with your validation system:
```tsx
<DocumentProcessor
  onComplete={(result) => {
    const validationResults = validateExtractedData(result.fields);
    if (validationResults.isValid) {
      proceedToNextStep(result);
    } else {
      showValidationErrors(validationResults.errors);
    }
  }}
/>
```
