
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Warn but don't crash immediately, let the components handle the error if they try to use it
    console.warn('Supabase URL or Anon Key is missing in .env file');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
