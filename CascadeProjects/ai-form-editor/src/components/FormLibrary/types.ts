export enum FormCategory {
  RESIDENCE = 'residence',
  BUSINESS = 'business',
  SOCIAL = 'social',
  HEALTH = 'health',
  EDUCATION = 'education'
}

export type SupportedLanguage = 'de' | 'en' | 'ar';

export interface LocalizedContent {
  de: string;
  en: string;
  ar: string;
  [key: string]: string; // Support for future languages
}

export interface FormTags {
  authority: string;
  state: string;
  languages: SupportedLanguage[];
  formType: string;
}

export interface Form {
  id: string;
  name: LocalizedContent;
  description: LocalizedContent;
  category: FormCategory;
  tags: FormTags;
  fileUrl: string;
  lastModified?: string;
  requiredDocuments: LocalizedContent[];
  submissionRequirements: LocalizedContent;
  direction?: 'ltr' | 'rtl';  // For language-specific text direction
}

export interface FormFilter {
  category?: FormCategory;
  authority?: string;
  state?: string;
  language?: SupportedLanguage;
  formType?: string;
  searchTerm?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date';
