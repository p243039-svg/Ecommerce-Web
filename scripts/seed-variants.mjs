import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env.local
const env = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    acc[key.trim()] = value.join('=').trim();
    return acc;
  }, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedVariants() {
  console.log('--- Ensuring All Products Have Variants ---');

  // 1. Fetch all products
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, brand, stock_quantity');

  if (prodError) {
    console.error('Error fetching products:', prodError);
    return;
  }

  // 2. Fetch all current variants
  const { data: variants, error: varError } = await supabase
    .from('product_variants')
    .select('product_id');

  if (varError) {
    console.error('Error fetching variants:', varError);
    return;
  }

  const productIdsWithVariants = new Set(variants.map(v => v.product_id));
  const missingProducts = products.filter(p => !productIdsWithVariants.has(p.id));

  console.log(`Found ${products.length} total products.`);
  console.log(`Found ${missingProducts.length} products without variants.`);

  if (missingProducts.length === 0) {
    console.log('All products already have variants. Skipping.');
    return;
  }

  // 3. Create default variants for missing products
  const variantsToInsert = missingProducts.map(p => ({
    product_id: p.id,
    size: 'Standard',
    color: 'Original',
    stock_quantity: p.stock_quantity || 0,
    sku: `${p.brand.slice(0, 3)}-${p.id.slice(0, 4)}`.toUpperCase(),
  }));

  const { error: insertError } = await supabase
    .from('product_variants')
    .insert(variantsToInsert);

  if (insertError) {
    console.error('Error inserting variants:', insertError);
  } else {
    console.log(`Successfully created ${variantsToInsert.length} default variants.`);
  }

  console.log('--- Seeding Finished ---');
}

seedVariants();
