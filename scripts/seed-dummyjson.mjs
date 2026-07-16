/**
 * seed-dummyjson.mjs
 * Fetches exactly 100 relevant products from DummyJSON API by specific category endpoints.
 * Then seeds the Supabase database via JS client.
 *
 * Usage: node scripts/seed-dummyjson.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://soovvcasbdrkfdgzgnbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3Z2Y2FzYmRya2ZkZ3pnbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3OTksImV4cCI6MjA5MTMwMDc5OX0.0wL_7bfjRiXtMsy3xovmSVRWyOi_ja_fm5Fdi7wj8t4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Category Config ──────────────────────────────────────────────
// Each entry: { id, name, slug, description, apiCategories[], limit }
// Total should sum to 100
const CATEGORY_CONFIG = [
  {
    id: 'cat-men',
    name: 'Men',
    slug: 'men',
    description: 'Premium menswear for the modern gentleman.',
    apiCategories: ['mens-shirts', 'mens-jackets', 'mens-watches'],
    limit: 20,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'cat-women',
    name: 'Women',
    slug: 'women',
    description: 'Elegant womenswear for every occasion.',
    apiCategories: ['womens-dresses', 'tops', 'womens-watches'],
    limit: 20,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-shoes',
    name: 'Shoes',
    slug: 'shoes',
    description: 'Step up your game with luxury footwear.',
    apiCategories: ['mens-shoes', 'womens-shoes'],
    limit: 20,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look with premium accessories.',
    apiCategories: ['womens-bags', 'womens-jewellery', 'sunglasses'],
    limit: 20,
    sizes: ['One Size'],
  },
  {
    id: 'cat-beauty',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Luxury skincare, beauty & fragrances.',
    apiCategories: ['beauty', 'fragrances', 'skin-care'],
    limit: 20,
    sizes: ['Standard'],
  },
];

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function fetchCategory(apiSlug) {
  try {
    const url = `https://dummyjson.com/products/category/${apiSlug}?limit=100`;
    console.log(`  Fetching: ${url}`);
    const res = await fetch(url);
    if (!res.ok) { console.warn(`  ⚠ ${apiSlug}: HTTP ${res.status}`); return []; }
    const data = await res.json();
    return data.products || [];
  } catch (e) {
    console.warn(`  ⚠ Failed to fetch ${apiSlug}:`, e.message);
    return [];
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('  ANTIQUE — DummyJSON Product Seed (100 Products)');
  console.log('======================================================\n');

  const standardCategories = CATEGORY_CONFIG.map(({ id, name, slug, description }) => ({ id, name, slug, description }));
  const allProducts = [];
  const allImages = [];

  // ── Step 1: Fetch products per category ──
  for (const catConfig of CATEGORY_CONFIG) {
    console.log(`\n📦 Category: ${catConfig.name} (target: ${catConfig.limit})`);
    const catProducts = [];

    for (const apiSlug of catConfig.apiCategories) {
      const items = await fetchCategory(apiSlug);
      catProducts.push(...items);
      if (catProducts.length >= catConfig.limit) break;
    }

    // Deduplicate by id and slice to limit
    const seen = new Set();
    const unique = catProducts.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
    const selected = unique.slice(0, catConfig.limit);

    console.log(`  ✓ ${selected.length}/${catConfig.limit} products selected for ${catConfig.name}`);

    for (const prod of selected) {
      const prodId = `prod-${prod.id}-${catConfig.id}`;
      const slug = `${slugify(prod.title)}-${prod.id}`;

      let compareAtPrice = null;
      if (prod.discountPercentage && prod.discountPercentage > 0) {
        compareAtPrice = Number((prod.price / (1 - prod.discountPercentage / 100)).toFixed(2));
      }

      allProducts.push({
        id: prodId,
        category_id: catConfig.id,
        name: prod.title,
        slug,
        description: prod.description,
        brand: prod.brand || 'ANTIQUE',
        price: prod.price,
        compare_at_price: compareAtPrice,
        stock_quantity: prod.stock || 50,
        sizes: catConfig.sizes,
        colors: ['Classic', 'Premium'],
        rating: prod.rating || 4.0,
        review_count: prod.reviews?.length || Math.floor(Math.random() * 50) + 10,
        is_featured: prod.rating >= 4.7,
        is_active: true,
        tags: prod.tags || [catConfig.name.toLowerCase()],
        reviews: prod.reviews ? JSON.stringify(prod.reviews) : '[]',
      });

      (prod.images || []).forEach((url, index) => {
        allImages.push({ product_id: prodId, url, sort_order: index, is_primary: index === 0 });
      });
      if (prod.thumbnail && !prod.images?.includes(prod.thumbnail)) {
        allImages.push({ product_id: prodId, url: prod.thumbnail, sort_order: 0, is_primary: true });
      }
    }
  }

  console.log(`\n✅ Total products to seed: ${allProducts.length}`);
  console.log(`✅ Total images to seed: ${allImages.length}`);

  // ── Step 2: Clear existing data ──
  console.log('\n🗑  Clearing existing data...');
  await supabase.from('product_images').delete().neq('product_id', 'NEVER-EXISTS');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', 'NEVER-EXISTS');
  await supabase.from('categories').delete().neq('id', 'NEVER-EXISTS');
  console.log('  Done.');

  // ── Step 3: Insert Categories ──
  console.log('\n📂 Inserting 5 categories...');
  const { error: catErr } = await supabase.from('categories').insert(standardCategories);
  if (catErr) { console.error('  ✗ Categories failed:', catErr.message); process.exit(1); }
  console.log('  ✓ Categories inserted.');

  // ── Step 4: Insert Products in batches of 20 ──
  console.log('\n📦 Inserting products...');
  let insertedProds = 0;
  for (let i = 0; i < allProducts.length; i += 20) {
    const batch = allProducts.slice(i, i + 20);
    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.warn(`  ⚠ Products batch ${i}-${i + 20} failed:`, error.message);
    } else {
      insertedProds += batch.length;
      process.stdout.write(`  [${insertedProds}/${allProducts.length}] inserted...\r`);
    }
  }
  console.log(`\n  ✓ ${insertedProds} products inserted.`);

  // ── Step 5: Insert Images in batches of 50 ──
  console.log('\n🖼  Inserting product images...');
  let insertedImgs = 0;
  for (let i = 0; i < allImages.length; i += 50) {
    const batch = allImages.slice(i, i + 50);
    const { error } = await supabase.from('product_images').insert(batch);
    if (error) {
      console.warn(`  ⚠ Images batch ${i}-${i + 50} failed:`, error.message);
    } else {
      insertedImgs += batch.length;
    }
  }
  console.log(`  ✓ ${insertedImgs} images inserted.`);

  // ── Summary ──
  console.log('\n======================================================');
  console.log(`  SEED COMPLETE!`);
  console.log(`  Products: ${insertedProds} | Images: ${insertedImgs}`);
  console.log('======================================================\n');
}

run().catch((e) => { console.error('Fatal error:', e); process.exit(1); });
