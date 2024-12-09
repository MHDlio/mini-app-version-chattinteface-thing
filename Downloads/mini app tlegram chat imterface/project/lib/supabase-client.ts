import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export const supabaseClient = createClientComponentClient<Database>();

export async function saveToSupabase(table: string, data: any) {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ table, data }),
    });

    if (!response.ok) {
      throw new Error('Failed to save data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
}