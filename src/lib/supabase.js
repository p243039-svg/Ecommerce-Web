import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Create the real Supabase client
const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Categories definition
const categories = [
  { id: 'cat-men', name: 'Men', slug: 'men', description: 'Premium menswear for the modern gentleman', image_url: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80', sort_order: 1 },
  { id: 'cat-women', name: 'Women', slug: 'women', description: 'Elegant womenswear for every occasion', image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80', sort_order: 2 },
  { id: 'cat-shoes', name: 'Shoes', slug: 'shoes', description: 'Step up your game with luxury footwear', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', sort_order: 3 },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', description: 'Complete your look with premium accessories', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', sort_order: 4 },
  { id: 'cat-beauty', name: 'Beauty', slug: 'beauty', description: 'Premium cosmetics, fragrances, and skincare products', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', sort_order: 5 }
];

const categoryMapping = {
  'beauty': 'cat-beauty',
  'fragrances': 'cat-beauty',
  'skin-care': 'cat-beauty',
  'mens-shirts': 'cat-men',
  'mens-shoes': 'cat-shoes',
  'womens-dresses': 'cat-women',
  'womens-shoes': 'cat-shoes',
  'womens-bags': 'cat-accessories',
  'womens-jewellery': 'cat-accessories',
  'tops': 'cat-women'
};

// Global in-memory cache for products and images
let productsCache = [];
let imagesCache = [];
let initializedPromise = null;

// Initialize the data from DummyJSON
function initializeData() {
  if (initializedPromise) return initializedPromise;
  
  initializedPromise = (async () => {
    try {
      const res = await fetch('https://dummyjson.com/products?limit=200');
      const json = await res.json();
      
      if (json.products && json.products.length > 0) {
        const filtered = json.products.filter(p => p.category in categoryMapping);
        
        productsCache = filtered.map((p, idx) => {
          const prodId = `prod-${p.id}`;
          const catId = categoryMapping[p.category];
          const slug = p.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
            
          return {
            id: prodId,
            category_id: catId,
            name: p.title,
            slug: slug,
            description: p.description,
            brand: p.brand || 'LUXE Brand',
            price: p.price,
            compare_at_price: Math.round(p.price * 1.3 * 100) / 100,
            stock_quantity: p.stock || 20,
            sizes: p.category.includes('shoes') ? ['7', '8', '9', '10', '11'] : ['S', 'M', 'L', 'XL'],
            colors: ['Classic Black', 'Pure White', 'Royal Blue', 'Champagne Rose'],
            rating: p.rating || 4.5,
            review_count: Math.floor(Math.random() * 200) + 10,
            is_featured: idx < 8, // Mark first 8 as featured
            is_active: true,
            created_at: new Date().toISOString()
          };
        });
        
        // Mapped images
        imagesCache = [];
        filtered.forEach(p => {
          const prodId = `prod-${p.id}`;
          imagesCache.push({
            id: `img-thumb-${p.id}`,
            product_id: prodId,
            url: p.thumbnail,
            sort_order: 0,
            is_primary: true
          });
          
          if (p.images && p.images.length > 0) {
            p.images.forEach((imgUrl, imgIdx) => {
              if (imgUrl !== p.thumbnail) {
                imagesCache.push({
                  id: `img-${p.id}-${imgIdx}`,
                  product_id: prodId,
                  url: imgUrl,
                  sort_order: imgIdx + 1,
                  is_primary: false
                });
              }
            });
          }
        });
      }
    } catch (e) {
      console.warn("Failed to load products from DummyJSON, fallback to offline mockup", e);
    }
  })();
  
  return initializedPromise;
}

// Mock auth object to prevent network calls to placeholder.supabase.co
const mockAuth = {
  async getSession() {
    return { data: { session: null }, error: null };
  },
  onAuthStateChange(callback) {
    return { data: { subscription: { unsubscribe() {} } } };
  },
  async signInWithPassword({ email, password }) {
    return { data: { user: { id: 'mock-uid', email, first_name: 'Mock', last_name: 'User', role: 'user' } }, error: null };
  },
  async signUp({ email, password, options }) {
    return { data: { user: { id: 'mock-uid', email, first_name: options?.data?.first_name || 'Mock', last_name: options?.data?.last_name || 'User', role: 'user' } }, error: null };
  },
  async signOut() {
    return { error: null };
  },
  async signInWithOAuth() {
    return { error: null };
  },
  async resetPasswordForEmail() {
    return { error: null };
  },
  async verifyOtp() {
    return { data: { session: { user: { id: 'mock-uid', email: 'user@example.com' } } }, error: null };
  },
  async updateUser() {
    return { error: null };
  }
};

// Builder class for mock Supabase query chains
class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.neqFilters = [];
    this.ilikeFilters = [];
    this.limitVal = null;
    this.orderVal = null;
  }
  
  select(queryStr = '*', options = {}) {
    return this;
  }
  
  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }
  
  neq(column, value) {
    this.neqFilters.push({ column, value });
    return this;
  }
  
  ilike(column, pattern) {
    this.ilikeFilters.push({ column, pattern });
    return this;
  }
  
  limit(val) {
    this.limitVal = val;
    return this;
  }
  
  order(column, options) {
    this.orderVal = { column, options };
    return this;
  }
  
  async execute() {
    await initializeData();
    
    let source = [];
    if (this.table === 'categories') {
      source = JSON.parse(JSON.stringify(categories));
    } else if (this.table === 'products') {
      source = JSON.parse(JSON.stringify(productsCache));
    } else if (this.table === 'product_images') {
      source = JSON.parse(JSON.stringify(imagesCache));
    } else {
      source = [];
    }
    
    // Apply eq filters
    for (const f of this.filters) {
      source = source.filter(item => item[f.column] === f.value);
    }
    // Apply neq filters
    for (const f of this.neqFilters) {
      source = source.filter(item => item[f.column] !== f.value);
    }
    // Apply ilike filters
    for (const f of this.ilikeFilters) {
      const regexStr = f.pattern.replace(/%/g, '.*');
      const regex = new RegExp(regexStr, 'i');
      source = source.filter(item => regex.test(item[f.column]));
    }
    
    // Attach nested product images
    if (this.table === 'products') {
      source = source.map(prod => {
        const prodImages = imagesCache.filter(img => img.product_id === prod.id);
        return {
          ...prod,
          images: prodImages,
          product_images: prodImages
        };
      });
    }
    
    // Apply sorting
    if (this.orderVal) {
      const { column, options } = this.orderVal;
      const asc = options?.ascending !== false;
      source.sort((a, b) => {
        if (a[column] < b[column]) return asc ? -1 : 1;
        if (a[column] > b[column]) return asc ? 1 : -1;
        return 0;
      });
    }
    
    // Apply limits
    if (this.limitVal !== null) {
      source = source.slice(0, this.limitVal);
    }
    
    return { data: source, error: null, count: source.length };
  }
  
  then(onfulfilled) {
    return this.execute().then(onfulfilled);
  }
  
  async maybeSingle() {
    const { data } = await this.execute();
    return { data: data[0] || null, error: null };
  }
  
  async single() {
    return this.maybeSingle();
  }
}

// Intercept queries and mock if connection fails or bypass completely
const mockClient = {
  auth: mockAuth,
  
  from(table) {
    const builder = new MockQueryBuilder(table);
    
    // Stub mutations inside from() return object directly
    builder.insert = function(data) {
      return {
        async then(onfulfilled) {
          return onfulfilled({ data, error: null });
        }
      };
    };
    
    builder.update = function(data) {
      return {
        eq(col, val) {
          return {
            async then(onfulfilled) {
              return onfulfilled({ data, error: null });
            }
          };
        }
      };
    };
    
    builder.delete = function() {
      return {
        eq(col, val) {
          return {
            async then(onfulfilled) {
              return onfulfilled({ data: [], error: null });
            }
          };
        },
        neq(col, val) {
          return {
            async then(onfulfilled) {
              return onfulfilled({ data: [], error: null });
            }
          };
        }
      };
    };
    
    return builder;
  }
};

// Auto initialize
initializeData();

export const supabase = mockClient;
