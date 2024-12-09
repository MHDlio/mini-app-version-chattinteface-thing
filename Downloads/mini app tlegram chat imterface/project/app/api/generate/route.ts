import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { type SuggestionOptions } from '@/lib/openai';
import { getSystemPrompt } from '@/lib/prompts';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

export async function POST(request: Request) {
  try {
    const { prompt, options = {} } = await request.json() as {
      prompt: string;
      options: SuggestionOptions;
    };

    const {
      language = 'en',
      tone = 'professional',
      industry = 'general',
      experienceLevel = 'mid',
      systemPrompt
    } = options;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt || getSystemPrompt(language, tone, industry, experienceLevel),
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}