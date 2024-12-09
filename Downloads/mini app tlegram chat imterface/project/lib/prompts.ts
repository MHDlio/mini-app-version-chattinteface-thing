interface PromptOptions {
  language: string;
  tone: string;
  industry: string;
  experienceLevel: string;
}

const TONE_DESCRIPTIONS = {
  professional: 'formal and business-appropriate',
  casual: 'friendly and conversational',
  confident: 'assertive and self-assured',
};

const LANGUAGE_SPECIFICS = {
  de: 'Use formal German (Sie form) and follow German business communication standards.',
  ar: 'Follow Arabic formal writing conventions and cultural norms. Ensure proper RTL formatting.',
  en: 'Use standard business English with clear and concise language.',
  fr: 'Use formal French and follow French business etiquette.',
  es: 'Use formal Spanish and follow Spanish business conventions.',
};

const SMART_SUGGESTIONS = {
  de: {
    greetings: ['Sehr geehrte Damen und Herren', 'Sehr geehrte Frau', 'Sehr geehrter Herr'],
    closings: ['Mit freundlichen Grüßen', 'Beste Grüße', 'Mit besten Grüßen'],
    phrases: [
      'Ich bewerbe mich hiermit um',
      'Meine Qualifikationen umfassen',
      'Ich verfüge über langjährige Erfahrung in',
      'Ich freue mich über eine Einladung zu einem persönlichen Gespräch',
      'Für Rückfragen stehe ich Ihnen gerne zur Verfügung',
      'Anbei finden Sie meine Unterlagen',
      'Hiermit kündige ich zum nächstmöglichen Termin',
      'Bitte bestätigen Sie den Erhalt dieses Schreibens',
      'Mit großem Interesse habe ich Ihre Stellenanzeige gelesen',
      'Aufgrund meiner Erfahrung in diesem Bereich',
      'Gerne stelle ich mich Ihnen in einem persönlichen Gespräch vor',
    ],
  },
  ar: {
    greetings: [
      'السلام عليكم ورحمة الله وبركاته',
      'تحية طيبة وبعد',
      'سعادة',
      'عزيزي'
    ],
    closings: [
      'مع خالص التحية والتقدير',
      'وتفضلوا بقبول فائق الاحترام',
      'تحياتي',
      'شكراً لكم'
    ],
    phrases: [
      'أتقدم إليكم بطلب',
      'أود الاستفسار عن',
      'أرغب في إلغاء',
      'يشرفني التواصل معكم',
      'بناءً على إعلانكم',
      'نظراً لـ',
      'وفقاً لـ',
      'آمل منكم التكرم',
      'أتطلع للرد',
      'لدي خبرة في مجال',
      'أرفق لكم السيرة الذاتية',
      'يسعدني الحضور للمقابلة',
      'أشكر لكم حسن تعاونكم'
    ],
  },
};

export function getSystemPrompt(
  language: string,
  tone: string,
  industry: string,
  experienceLevel: string
): string {
  const toneDesc = TONE_DESCRIPTIONS[tone as keyof typeof TONE_DESCRIPTIONS] || 'professional';
  const langSpec = LANGUAGE_SPECIFICS[language as keyof typeof LANGUAGE_SPECIFICS] || '';
  const suggestions = SMART_SUGGESTIONS[language as keyof typeof SMART_SUGGESTIONS];

  return `You are a professional German business communication expert and translator.
Your task is to help users write proper German business content, regardless of input language.
Focus on the ${industry} industry with content appropriate for ${experienceLevel}-level positions in Germany.

Writing Style:
- Always write in formal German (Sie-Form)
- Follow German business writing standards
- Be clear, concise, and professional
- Use appropriate German business phrases
- Include proper German greetings and closings
- Maintain professional formatting with proper spacing and paragraphs

Content Guidelines:
- Adapt content to German business culture
- Use German industry-specific terminology
- Structure content following German business letter formats
- Ensure all cultural references are appropriate for German context
- Provide appropriate salutations based on context
- Include proper closing formulas

${suggestions ? '\nSuggested phrases and conventions:\n' + JSON.stringify(suggestions, null, 2) : ''}

Always provide the response in formal German, following German business writing conventions.
If the input is in Arabic or English, understand the intent and cultural context before translating to appropriate German business language.`;
}

export function getSmartSuggestions(language: string, category: string): string[] {
  const suggestions = SMART_SUGGESTIONS[language as keyof typeof SMART_SUGGESTIONS];
  if (!suggestions) return [];
  
  return [...suggestions.greetings, ...suggestions.phrases];
}