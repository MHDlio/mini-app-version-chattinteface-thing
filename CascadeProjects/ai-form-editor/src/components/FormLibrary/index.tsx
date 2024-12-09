import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Download, HelpCircle, Grid, List, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { useTutorial } from '@/components/TutorialProvider';
import { formLibraryTutorial } from './tutorial';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormCategory,
  FormFilter,
  FormTags,
  ViewMode,
  SortBy,
  Language,
} from './types';
import { cn } from '@/utils/cn';

interface FormLibraryProps {
  onSelect?: (form: Form) => void;
  className?: string;
  defaultLanguage?: Language;
}

const supportedLanguages: Language[] = ['de', 'en', 'ar'];

export const FormLibrary: React.FC<FormLibraryProps> = ({
  onSelect,
  className,
  defaultLanguage = 'de',
}) => {
  const { t, i18n } = useTranslation();
  const { startTutorial, isActive: isTutorialActive } = useTutorial();
  const [forms, setForms] = useState<Form[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filter, setFilter] = useState<FormFilter>({});
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch forms
  React.useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('/api/forms');
        if (!response.ok) throw new Error('Failed to fetch forms');
        const data = await response.json();
        setForms(data);
      } catch (err) {
        setError(t('formLibrary.error.fetch'));
        console.error('Error fetching forms:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
  }, [t]);

  // Filter and sort forms
  const filteredForms = useMemo(() => {
    let result = [...forms];

    // Apply filters
    if (filter.category) {
      result = result.filter(form => form.category === filter.category);
    }
    if (filter.authority) {
      result = result.filter(form => form.tags.authority === filter.authority);
    }
    if (filter.state) {
      result = result.filter(form => form.tags.state === filter.state);
    }
    if (filter.language) {
      result = result.filter(form => form.tags.languages.includes(filter.language));
    }
    if (filter.formType) {
      result = result.filter(form => form.tags.formType === filter.formType);
    }

    // Apply search
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(form =>
        form.name[language].toLowerCase().includes(searchLower) ||
        form.description[language].toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    return result.sort((a, b) => {
      if (sortBy === 'date' && a.lastModified && b.lastModified) {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
      return a.name[language].localeCompare(b.name[language]);
    });
  }, [forms, filter, debouncedSearch, sortBy, language]);

  // Get unique filter options
  const filterOptions = useMemo(() => ({
    authorities: [...new Set(forms.map(f => f.tags.authority))],
    states: [...new Set(forms.map(f => f.tags.state))],
    formTypes: [...new Set(forms.map(f => f.tags.formType))],
    languages: [...new Set(forms.flatMap(f => f.tags.languages))],
  }), [forms]);

  // Get text direction based on language
  const getTextDirection = (lang: Language) => {
    return lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = getTextDirection(language);
  }, [language]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isTutorialActive) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredForms.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredForms.length) {
          onSelect?.(filteredForms[selectedIndex]);
        }
        break;
      case 'd':
        if (e.ctrlKey && selectedIndex >= 0) {
          e.preventDefault();
          window.open(filteredForms[selectedIndex].fileUrl, '_blank');
        }
        break;
      case '?':
        e.preventDefault();
        startTutorial(formLibraryTutorial);
        break;
    }
  }, [filteredForms, selectedIndex, onSelect, startTutorial, isTutorialActive]);

  const renderForm = (form: Form, index: number) => (
    <motion.div
      key={form.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-4 border rounded-lg hover:shadow-md transition-shadow",
        "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
        index === selectedIndex && "ring-2 ring-blue-500",
        viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col',
        getTextDirection(language)
      )}
      onClick={() => onSelect?.(form)}
      tabIndex={0}
      role="button"
      aria-selected={index === selectedIndex}
      dir={getTextDirection(language)}
    >
      <div className={viewMode === 'list' ? 'flex-1' : ''}>
        <h3 className="font-medium">{form.name[language]}</h3>
        <p className="text-sm text-gray-600 mt-1">{form.description[language]}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {form.category}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {form.tags.authority}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {form.tags.state}
          </span>
        </div>

        {/* Required Documents */}
        {viewMode === 'grid' && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">{t('formLibrary.requiredDocuments')}</h4>
            <ul className="mt-1 text-sm text-gray-600">
              {form.requiredDocuments[language].map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={viewMode === 'list' ? 'flex items-center' : 'mt-4'}>
        <a
          href={form.fileUrl}
          download
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-gray-400 hover:text-gray-600"
          aria-label={t('formLibrary.download')}
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-4", className, getTextDirection(language))}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('formLibrary.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={t('formLibrary.searchLabel')}
          />
        </div>

        {/* Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {Object.entries(filterOptions).map(([key, values]) => (
              <DropdownMenu key={key}>
                <DropdownMenuTrigger className="w-full px-2 py-1.5 text-sm">
                  {t(`formLibrary.filters.${key}`)}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {values.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setFilter(prev => ({
                        ...prev,
                        [key.slice(0, -1)]: value
                      }))}
                    >
                      {value}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          aria-label={t('formLibrary.toggleView')}
        >
          {viewMode === 'grid' ? (
            <List className="h-4 w-4" />
          ) : (
            <Grid className="h-4 w-4" />
          )}
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(prev => supportedLanguages.includes(prev) ? prev : 'de')}
        >
          {language.toUpperCase()}
        </Button>

        {/* Language Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              {language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {supportedLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
              >
                {lang.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startTutorial(formLibraryTutorial)}
          className="text-gray-500 hover:text-gray-700"
          aria-label={t('formLibrary.startTutorial')}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Form List */}
      <div className={cn(
        'grid gap-4',
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
        getTextDirection(language)
      )}>
        <AnimatePresence>
          {filteredForms.map((form, index) => renderForm(form, index))}
        </AnimatePresence>

        {filteredForms.length === 0 && (
          <p className="text-center text-gray-500 py-8 col-span-full">
            {t('formLibrary.noResults')}
          </p>
        )}
      </div>
    </div>
  );
};
