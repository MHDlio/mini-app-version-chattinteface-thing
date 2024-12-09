# Form Library Component

A minimal, keyboard-focused form template browser component that enables users to efficiently search and access form templates.

## Features
- Keyboard-driven search functionality
- Clean, minimal UI design
- Efficient form template browsing
- Accessible download options
- Interactive tutorial system

## Usage

```tsx
import { FormLibrary } from './components/FormLibrary';
import { TutorialProvider } from './components/TutorialProvider';

// Basic usage with tutorial support
const App = () => (
  <TutorialProvider>
    <FormLibrary 
      onSelect={(form) => console.log('Selected form:', form)} 
    />
  </TutorialProvider>
);
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate through forms |
| `Enter` | Select current form |
| `Ctrl + D` | Download selected form |
| `?` | Start tutorial |

## API

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSelect` | `(form: Form) => void` | Optional callback when a form is selected |
| `className` | `string` | Optional custom CSS classes |

### Form Interface

```typescript
interface Form {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  lastModified?: string;
}
```

## Tutorial System

The FormLibrary includes an interactive tutorial that guides users through its features:
1. Introduction to the library
2. Using keyboard search
3. Keyboard navigation
4. Downloading forms
5. Best practices and tips

Access the tutorial by:
- Clicking the help icon
- Pressing the `?` key

## Internationalization

The FormLibrary component supports multiple languages with full RTL (Right-to-Left) support:

- German (de)
- English (en)
- Arabic (ar)

### Adding New Languages

The component is designed to be language-extensible. To add a new language:

1. Update the `SupportedLanguage` type in `types.ts`
2. Add the language content to your form data
3. Add the language button to the language selector

### RTL Support

Arabic and other RTL languages are fully supported with:
- Automatic text direction switching
- RTL-aware layouts and animations
- RTL-compatible keyboard navigation
- Proper text alignment and spacing

### Language Selection

Users can switch languages via:
- Language selector buttons in the header
- Keyboard shortcut: `Ctrl + L`
- URL parameter: `?lang=ar`

The component will:
- Persist language preference
- Fall back to English if a translation is missing
- Maintain RTL/LTR context during transitions

## Architecture

The component follows these key principles:
1. **Minimal State**: Only maintains search term and form data
2. **Keyboard First**: Optimized for keyboard interactions
3. **Performance**: Uses debounced search and memoization
4. **Accessibility**: Full keyboard navigation and ARIA support
5. **Tutorial Integration**: Built-in interactive guidance

## Internal Components

1. **SearchBar**: Handles keyboard input and search
2. **FormList**: Renders the filtered form list
3. **FormCard**: Individual form display component
4. **TutorialSystem**: Guides users through features
