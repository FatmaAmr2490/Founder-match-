import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testSupabase = async () => {
  const { data, error } = await window.supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Connection Error:', error);
  } else {
    console.log('Successfully connected to Supabase!');
    console.log('Test query result:', data);
  }
};

testSupabase(); 