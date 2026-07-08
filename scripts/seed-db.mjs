import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Since we can't easily import from src/lib/mock-data.ts in a pure mjs script without transpilation
// We will read the file and extract the arrays or just define the logic to fetch them.
// A simpler way: The user probably has 'tsx' or 'esbuild-register'?
// Let's just create a standalone seed script with the actual data from mock-data.ts directly.

const supabaseUrl = 'https://soovvcasbdrkfdgzgnbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3Z2Y2FzYmRya2ZkZ3pnbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3OTksImV4cCI6MjA5MTMwMDc5OX0.0wL_7bfjRiXtMsy3xovmSVRWyOi_ja_fm5Fdi7wj8t4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
  { id: "cat-1", name: "Men", slug: "men", description: "Premium menswear for the modern gentleman", image_url: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80", sort_order: 1 },
  { id: "cat-2", name: "Women", slug: "women", description: "Elegant womenswear for every occasion", image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", sort_order: 2 },
  { id: "cat-3", name: "Shoes", slug: "shoes", description: "Step up your game with luxury footwear", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", sort_order: 3 },
  { id: "cat-4", name: "Accessories", slug: "accessories", description: "Complete your look with premium accessories", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", sort_order: 4 },
  { id: "cat-5", name: "Activewear", slug: "activewear", description: "Performance meets style in our activewear line", image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", sort_order: 5 },
  { id: "cat-6", name: "Outerwear", slug: "outerwear", description: "Weather the elements in style", image_url: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=600&q=80", sort_order: 6 }
];

const products = [
  { id: "prod-1", category_id: "cat-1", name: "Classic Leather Jacket", slug: "classic-leather-jacket", description: "A timeless leather jacket crafted from premium Italian lambskin.", brand: "LUXE Originals", price: 299.99, compare_at_price: 449.99, stock_quantity: 15, sizes: ["S", "M", "L", "XL"], colors: ["Black", "Brown"], rating: 4.8, review_count: 124, is_featured: true, is_active: true, created_at: "2025-01-15T10:00:00Z" },
  { id: "prod-2", category_id: "cat-2", name: "Silk Evening Dress", slug: "silk-evening-dress", description: "An exquisite silk evening dress in a stunning deep red.", brand: "Velvet Rose", price: 189.99, compare_at_price: 279.99, stock_quantity: 8, sizes: ["XS", "S", "M", "L"], colors: ["Red", "Black", "Navy"], rating: 4.9, review_count: 89, is_featured: true, is_active: true, created_at: "2025-02-01T10:00:00Z" },
  { id: "prod-3", category_id: "cat-3", name: "Urban Runner Sneakers", slug: "urban-runner-sneakers", description: "Minimalist white sneakers built for all-day comfort.", brand: "StrideX", price: 149.99, compare_at_price: 199.99, stock_quantity: 22, sizes: ["7", "8", "9", "10", "11", "12"], colors: ["White", "Black", "Grey"], rating: 4.7, review_count: 256, is_featured: true, is_active: true, created_at: "2025-01-20T10:00:00Z" },
  { id: "prod-4", category_id: "cat-1", name: "Slim Fit Chino Pants", slug: "slim-fit-chino-pants", description: "Versatile slim-fit chino pants crafted from premium stretch cotton.", brand: "LUXE Originals", price: 79.99, compare_at_price: 99.99, stock_quantity: 30, sizes: ["28", "30", "32", "34", "36"], colors: ["Khaki", "Navy", "Olive", "Black"], rating: 4.5, review_count: 178, is_featured: false, is_active: true, created_at: "2025-03-01T10:00:00Z" },
  { id: "prod-5", category_id: "cat-2", name: "Cashmere Blend Sweater", slug: "cashmere-blend-sweater", description: "Luxuriously soft cashmere-wool blend sweater.", brand: "Velvet Rose", price: 129.99, stock_quantity: 18, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Cream", "Blush", "Grey", "Camel"], rating: 4.6, review_count: 67, is_featured: true, is_active: true, created_at: "2025-02-15T10:00:00Z" },
  { id: "prod-6", category_id: "cat-4", name: "Italian Leather Belt", slug: "italian-leather-belt", description: "Handcrafted Italian leather belt with a brushed gold buckle.", brand: "Artisan Co.", price: 59.99, compare_at_price: 89.99, stock_quantity: 40, sizes: ["S", "M", "L", "XL"], colors: ["Black", "Brown", "Tan"], rating: 4.4, review_count: 92, is_featured: false, is_active: true, created_at: "2025-01-10T10:00:00Z" },
  { id: "prod-7", category_id: "cat-5", name: "Performance Track Jacket", slug: "performance-track-jacket", description: "Lightweight technical jacket with moisture-wicking fabric.", brand: "StrideX", price: 89.99, compare_at_price: 119.99, stock_quantity: 25, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Navy", "Charcoal"], rating: 4.3, review_count: 145, is_featured: false, is_active: true, created_at: "2025-03-10T10:00:00Z" },
  { id: "prod-8", category_id: "cat-6", name: "Wool Overcoat", slug: "wool-overcoat", description: "A distinguished double-breasted wool overcoat.", brand: "LUXE Originals", price: 349.99, compare_at_price: 499.99, stock_quantity: 10, sizes: ["S", "M", "L", "XL"], colors: ["Charcoal", "Camel", "Navy"], rating: 4.9, review_count: 56, is_featured: true, is_active: true, created_at: "2025-01-05T10:00:00Z" }
];

const productImages = [
  { product_id: "prod-1", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-2", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-3", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-4", url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-5", url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-6", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-7", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80", sort_order: 0, is_primary: true },
  { product_id: "prod-8", url: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=800&q=80", sort_order: 0, is_primary: true }
];

async function seed() {
  console.log('--- Starting Seed ---');

  // Insert Categories
  console.log('Seeding categories...');
  const { error: catErr } = await supabase.from('categories').upsert(categories);
  if (catErr) console.error('Category error:', catErr.message);

  // Insert Products
  console.log('Seeding products...');
  const { error: prodErr } = await supabase.from('products').upsert(products);
  if (prodErr) console.error('Product error:', prodErr.message);

  // Insert Images
  console.log('Seeding images...');
  const { error: imgErr } = await supabase.from('product_images').upsert(productImages);
  if (imgErr) console.error('Image error:', imgErr.message);

  console.log('--- Seed Finished ---');
}

seed();
