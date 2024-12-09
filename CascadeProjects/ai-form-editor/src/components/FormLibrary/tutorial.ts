import type { TutorialConfig } from '@/types/smart-process';

export const formLibraryTutorial: TutorialConfig = {
  id: 'form-library',
  title: 'Form Library Tutorial',
  description: 'Learn how to effectively use the Form Library',
  steps: [
    {
      id: 'intro',
      title: 'Welcome to Form Library',
      content: 'The Form Library helps you find and manage form templates. Let\'s learn how to use it effectively.',
      helpText: 'You can exit this tutorial at any time by clicking the X button.'
    },
    {
      id: 'search',
      title: 'Keyboard Search',
      content: 'Start typing to instantly search through forms. The search looks through both form names and descriptions.',
      helpText: 'Pro tip: The search is optimized for quick responses and updates as you type.'
    },
    {
      id: 'navigation',
      title: 'Keyboard Navigation',
      content: 'Use arrow keys (↑ and ↓) to navigate through forms. Press Enter to select a form.',
      helpText: 'Keyboard navigation makes it fast and efficient to work with multiple forms.'
    },
    {
      id: 'download',
      title: 'Downloading Forms',
      content: 'Click the download icon or press Ctrl+D when a form is selected to download it.',
      helpText: 'Downloaded forms will be saved to your default downloads folder.'
    },
    {
      id: 'completion',
      title: 'Ready to Start',
      content: 'You\'re now ready to use the Form Library! Remember to use keyboard shortcuts for the best experience.',
      helpText: 'You can always access this tutorial again from the help menu.'
    }
  ]
};
