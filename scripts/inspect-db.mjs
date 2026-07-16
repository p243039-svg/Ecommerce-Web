import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://soovvcasbdrkfdgzgnbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3Z2Y2FzYmRya2ZkZ3pnbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3OTksImV4cCI6MjA5MTMwMDc5OX0.0wL_7bfjRiXtMsy3xovmSVRWyOi_ja_fm5Fdi7wj8t4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data: users, error: userError } = await supabase.from('users').select('*');
  console.log('All Users:', users, 'Error:', userError);
}

inspect();
