import { OpenAI } from 'openai';
import { type SuggestionOptions } from '@/types';

export async function generateSuggestions(
  prompt: string,
  options: SuggestionOptions = {}
): Promise<string | null> {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are a professional German business communication expert.
Your task is to convert any input into proper formal German business communication.
Always write in Sie-Form and follow German business standards.
Understand input in any language and reformulate as appropriate German business writing.`,
      },
      {
        role: 'user',
        content: `Input language: ${options.language}
Desired tone: ${options.tone}
Content to convert to German:

${prompt}

Convert this to formal German business writing:
1. Maintains the original intent
2. Follows German business writing standards
3. Uses appropriate formal language (Sie-Form)
4. Includes proper German greetings and closings
5. Adapts cultural context for German business`,
      },
    ];

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: messages[1].content,
        options: {
          ...options,
          language: 'de',
          systemPrompt: messages[0].content
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}