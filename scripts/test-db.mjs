import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://soovvcasbdrkfdgzgnbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3Z2Y2FzYmRya2ZkZ3pnbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3OTksImV4cCI6MjA5MTMwMDc5OX0.0wL_7bfjRiXtMsy3xovmSVRWyOi_ja_fm5Fdi7wj8t4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('--- DB Stats ---');
  
  const { data: cats, error: catErr } = await supabase.from('categories').select('id, name, slug');
  if (catErr) console.error('Categories error:', catErr.message);
  else console.log(`Categories found: ${cats?.length || 0}`);

  const { data: prods, error: prodErr } = await supabase.from('products').select('id, name');
  if (prodErr) console.error('Products error:', prodErr.message);
  else console.log(`Products found: ${prods?.length || 0}`);

  const { data: imgs, error: imgErr } = await supabase.from('product_images').select('id');
  if (imgErr) console.error('Images error:', imgErr.message);
  else console.log(`Images found: ${imgs?.length || 0}`);

  if (cats && cats.length > 0) {
    console.log('Sample category:', cats[0]);
  }
}

testFetch();
