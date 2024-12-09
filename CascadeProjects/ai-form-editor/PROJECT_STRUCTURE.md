# AI Form Editor - Project Structure

```
ai-form-editor/
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIAssistant/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── AIAssistantContent.tsx
│   │   │   │   ├── AIFeedbackButtons.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── AIChat/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── styles.module.css
│   │   │   └── DocumentProcessor/
│   │   │       ├── index.tsx
│   │   │       ├── ProcessingQueue.tsx
│   │   │       └── ResultViewer.tsx
│   │   ├── form/
│   │   │   ├── FormEditor/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormSection.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── fields/
│   │   │   │   ├── TextField.tsx
│   │   │   │   ├── SelectField.tsx
│   │   │   │   ├── DateField.tsx
│   │   │   │   └── FileField.tsx
│   │   │   └── validation/
│   │   │       ├── rules.ts
│   │   │       └── validators.ts
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/
│   │       ├── Button/
│   │       ├── Modal/
│   │       ├── Toast/
│   │       └── Loading/
│   ├── contexts/
│   │   ├── AIAssistantContext.tsx
│   │   ├── FormContext.tsx
│   │   ├── DocumentContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── ai/
│   │   │   ├── useAIAssistant.ts
│   │   │   ├── useDocumentProcessor.ts
│   │   │   └── useContextLearning.ts
│   │   ├── form/
│   │   │   ├── useFormValidation.ts
│   │   │   ├── useFormSync.ts
│   │   │   └── useFieldContext.ts
│   │   └── shared/
│   │       ├── useDebounce.ts
│   │       ├── useToast.ts
│   │       └── useErrorBoundary.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── aiService.ts
│   │   │   ├── documentService.ts
│   │   │   └── modelService.ts
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── interceptors.ts
│   │   └── storage/
│   │       ├── localStore.ts
│   │       └── sessionStore.ts
│   ├── types/
│   │   ├── ai.ts
│   │   ├── form.ts
│   │   ├── document.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── ai/
│   │   │   ├── contextUtils.ts
│   │   │   ├── suggestionUtils.ts
│   │   │   └── privacyUtils.ts
│   │   ├── form/
│   │   │   ├── fieldUtils.ts
│   │   │   ├── validationUtils.ts
│   │   │   └── syncUtils.ts
│   │   └── shared/
│   │       ├── dateUtils.ts
│   │       ├── stringUtils.ts
│   │       └── errorUtils.ts
│   ├── constants/
│   │   ├── ai.ts
│   │   ├── form.ts
│   │   └── api.ts
│   └── styles/
│       ├── global.css
│       ├── variables.css
│       └── themes/
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   └── locales/
├── docs/
│   ├── COMPONENT_ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── SECURITY.md
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
│   ├── build.js
│   └── deploy.js
├── config/
│   ├── webpack.config.js
│   └── jest.config.js
├── .github/
│   └── workflows/
├── package.json
├── tsconfig.json
└── README.md
```
