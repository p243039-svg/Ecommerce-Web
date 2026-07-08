import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://soovvcasbdrkfdgzgnbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3Z2Y2FzYmRya2ZkZ3pnbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3OTksImV4cCI6MjA5MTMwMDc5OX0.0wL_7bfjRiXtMsy3xovmSVRWyOi_ja_fm5Fdi7wj8t4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categoryMapping = {
  // DummyJSON Category -> { id, name, slug }
  'beauty': { id: 'cat-beauty', name: 'Beauty', slug: 'beauty', description: 'Premium cosmetics, fragrances, and skincare products', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', sort_order: 5 },
  'fragrances': { id: 'cat-beauty', name: 'Beauty', slug: 'beauty' },
  'skin-care': { id: 'cat-beauty', name: 'Beauty', slug: 'beauty' },
  'mens-shirts': { id: 'cat-men', name: 'Men', slug: 'men', description: 'Premium menswear for the modern gentleman', image_url: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80', sort_order: 1 },
  'mens-shoes': { id: 'cat-shoes', name: 'Shoes', slug: 'shoes', description: 'Step up your game with luxury footwear', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', sort_order: 3 },
  'womens-dresses': { id: 'cat-women', name: 'Women', slug: 'women', description: 'Elegant womenswear for every occasion', image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80', sort_order: 2 },
  'womens-shoes': { id: 'cat-shoes', name: 'Shoes', slug: 'shoes' },
  'womens-bags': { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', description: 'Complete your look with premium accessories', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', sort_order: 4 },
  'womens-jewellery': { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
  'tops': { id: 'cat-women', name: 'Women', slug: 'women' }
};

async function fetchAndSeed() {
  try {
    console.log('Fetching products from DummyJSON...');
    // DummyJSON has 194 products maximum. Let's fetch 200 to get all of them.
    const res = await fetch('https://dummyjson.com/products?limit=200');
    const json = await res.json();
    
    if (!json.products || json.products.length === 0) {
      throw new Error('No products fetched from DummyJSON');
    }
    
    console.log(`Fetched ${json.products.length} products. Filtering for clothing and beauty...`);
    
    const filteredProducts = json.products.filter(p => p.category in categoryMapping);
    console.log(`Found ${filteredProducts.length} matching products.`);
    
    // Select exactly 50 products
    const selectedProducts = filteredProducts.slice(0, 50);
    console.log(`Selected exactly ${selectedProducts.length} products to seed.`);
    
    // Construct Categories
    const categoriesToInsert = [];
    const seenCatIds = new Set();
    
    for (const key in categoryMapping) {
      const cat = categoryMapping[key];
      if (cat.description && !seenCatIds.has(cat.id)) {
        seenCatIds.add(cat.id);
        categoriesToInsert.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image_url: cat.image_url,
          sort_order: cat.sort_order
        });
      }
    }
    
    console.log('Categories to seed:', categoriesToInsert);
    
    // Clear existing data (optional, but good for clean state)
    console.log('Cleaning existing product_images, products, categories...');
    await supabase.from('product_images').delete().neq('product_id', 'none');
    await supabase.from('products').delete().neq('id', 'none');
    await supabase.from('categories').delete().neq('id', 'none');
    
    // Seed Categories
    console.log('Seeding categories...');
    const catRes = await supabase.from('categories').insert(categoriesToInsert);
    if (catRes.error) {
      console.error('Error seeding categories:', catRes.error);
    } else {
      console.log('Categories seeded successfully!');
    }
    
    // Construct Products and Product Images
    const productsToInsert = [];
    const imagesToInsert = [];
    
    selectedProducts.forEach((p, idx) => {
      const prodId = `prod-${p.id}`;
      const mappedCat = categoryMapping[p.category];
      
      const slug = p.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
        
      productsToInsert.push({
        id: prodId,
        category_id: mappedCat.id,
        name: p.title,
        slug: slug,
        description: p.description,
        brand: p.brand || 'LUXE Brand',
        price: p.price,
        compare_at_price: Math.round(p.price * 1.3 * 100) / 100, // 30% higher
        stock_quantity: p.stock || 20,
        sizes: p.category.includes('shoes') ? ['7', '8', '9', '10', '11'] : ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue', 'Pink'],
        rating: p.rating || 4.5,
        review_count: Math.floor(Math.random() * 200) + 10,
        is_featured: idx < 6, // Make first 6 featured
        is_active: true,
        created_at: new Date().toISOString()
      });
      
      // Thumbnail as primary image
      imagesToInsert.push({
        product_id: prodId,
        url: p.thumbnail,
        sort_order: 0,
        is_primary: true
      });
      
      // Add other images
      if (p.images && p.images.length > 0) {
        p.images.forEach((imgUrl, imgIdx) => {
          if (imgUrl !== p.thumbnail) {
            imagesToInsert.push({
              product_id: prodId,
              url: imgUrl,
              sort_order: imgIdx + 1,
              is_primary: false
            });
          }
        });
      }
    });
    
    console.log('Seeding products...');
    const prodRes = await supabase.from('products').insert(productsToInsert);
    if (prodRes.error) {
      console.error('Error seeding products:', prodRes.error);
    } else {
      console.log('Products seeded successfully!');
    }
    
    console.log('Seeding product images...');
    const imgRes = await supabase.from('product_images').insert(imagesToInsert);
    if (imgRes.error) {
      console.error('Error seeding product images:', imgRes.error);
    } else {
      console.log('Product images seeded successfully!');
    }
    
    console.log('Migration and seeding completed successfully!');
    
  } catch (err) {
    console.error('Seeding process failed:', err.message);
  }
}

fetchAndSeed();
