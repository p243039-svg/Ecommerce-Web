-- ==========================================
-- ANTIQUE MASTER DATABASE SETUP (COMPLETE)
-- ==========================================
-- Run this ENTIRE script in Supabase SQL Editor.
-- It includes: schema, RLS policies, triggers, seed data
-- with 4+ images per product for carousel fallback.

-- =============================================
-- 1. CLEANUP
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS reduce_stock_trigger ON public.order_items;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.reduce_stock_on_order();

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 2. CORE TABLES
-- =============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand TEXT,
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  stock_quantity INTEGER DEFAULT 0,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  reviews JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  variant_id UUID,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL,
  size TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can read all users" ON public.users;

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Allow service role (used in API routes & triggers) full access
CREATE POLICY "Service role full access to users"
  ON public.users FOR ALL TO service_role
  USING (true);

-- Products - publicly readable
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Product images - publicly readable
DROP POLICY IF EXISTS "Product images are publicly readable" ON public.product_images;
CREATE POLICY "Product images are publicly readable"
  ON public.product_images FOR SELECT TO anon, authenticated
  USING (true);

-- Categories - publicly readable
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (true);

-- Orders - users see their own
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items - follow parent order visibility
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- =============================================
-- 4. TRIGGERS & FUNCTIONS
-- =============================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Stock management
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants
      SET stock_quantity = stock_quantity - NEW.quantity
      WHERE id = NEW.variant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_stock_trigger
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_order();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- =============================================
-- 5. SEED CATEGORIES
-- =============================================
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
('cat_men', 'Men', 'men', 'High-end menswear from the world''s finest ateliers.', '/images/categories/men.jpg', 1),
('cat_women', 'Women', 'women', 'Ethereal womenswear designed for the modern silhouette.', '/images/categories/women.jpg', 2),
('cat_shoes', 'Shoes', 'shoes', 'Architectural footwear crafted with centuries-old precision.', '/images/categories/shoes.jpg', 3);

-- =============================================
-- 6. SEED PRODUCTS
-- =============================================
INSERT INTO products (id, category_id, name, slug, description, brand, price, compare_at_price, stock_quantity, sizes, colors, rating, review_count, is_featured) VALUES
('p1', 'cat_men', 'Luxury Silk Blouson', 'luxury-silk-blouson', 'A fluid silhouette crafted from pure Italian silk.', 'LUXE Atelier', 850.00, 1200.00, 15, '{"S","M","L","XL"}', '{"Midnight Blue","Sand"}', 4.8, 12, true),
('p2', 'cat_men', 'Architectural Wool Coat', 'architectural-wool-coat', 'Structured outerwear for the discerning minimalist.', 'LUXE Studio', 1250.00, NULL, 10, '{"M","L","XL"}', '{"Charcoal","Camel"}', 4.9, 24, true),
('p3', 'cat_men', 'Hand-Stitched Suede Overcoat', 'suede-overcoat', 'Unrivaled softness in a classic trench silhouette.', 'Heritage', 2400.00, 3100.00, 5, '{"M","L"}', '{"Tobacco"}', 5.0, 8, true),
('p4', 'cat_men', 'Technical Knit Sweater', 'tech-knit-sweater', 'Breathable performance meets high-fashion aesthetics.', 'Aura', 450.00, NULL, 25, '{"S","M","L","XL"}', '{"Black","Cloud"}', 4.7, 45, false),
('p5', 'cat_men', 'Egyptian Cotton Crisp Shirt', 'egyptian-cotton-shirt', 'The perfect tailored shirt for every occasion.', 'Essential', 180.00, 250.00, 50, '{"S","M","L","XL","XXL"}', '{"White","Blue"}', 4.6, 120, false),
('p6', 'cat_men', 'Raw Indigo Selvedge Denim', 'selvedge-denim', 'Japanese denim that ages beautifully with time.', 'LUXE Studio', 320.00, NULL, 30, '{"30","32","34","36"}', '{"Indigo"}', 4.9, 56, false),
('p7', 'cat_men', 'Cashmere Lined Leather Jacket', 'leather-jacket', 'The ultimate investment piece.', 'Luxury Atelier', 3500.00, 4200.00, 3, '{"M","L"}', '{"Noir"}', 5.0, 4, true),
('p8', 'cat_men', 'Velvet Evening Blazer', 'velvet-blazer', 'Command the room with deep-pile silk velvet.', 'Elite', 950.00, 1100.00, 8, '{"S","M","L"}', '{"Burgundy","Emerald"}', 4.8, 15, true),
('p9', 'cat_men', 'Merino Silk Polo', 'merino-silk-polo', 'Lightweight luxury for transitional weather.', 'LUXE Studio', 220.00, NULL, 40, '{"S","M","L","XL"}', '{"Olive","Navy"}', 4.5, 30, false),
('p10', 'cat_men', 'Tailored Linen Trousers', 'linen-trousers', 'Breathable elegance for summer soirees.', 'Heritage', 280.00, 350.00, 20, '{"30","32","34","36"}', '{"Ecru","Slate"}', 4.4, 18, false),
('p11', 'cat_men', 'Silk-Cashmere Scarf', 'silk-cashmere-scarf', 'Delicate warmth in a generous oversized cut.', 'Essential', 140.00, NULL, 60, '{"One Size"}', '{"Gray","Oat"}', 4.8, 88, false),
('p12', 'cat_men', 'Guayabera Luxe Shirt', 'guayabera-shirt', 'Traditional embroidery meets architectural cuts.', 'Aura', 290.00, 400.00, 15, '{"M","L","XL"}', '{"White"}', 4.7, 22, false),
('p13', 'cat_men', 'Heavyweight Terry Hoodie', 'luxury-hoodie', 'The elevated everyday essential.', 'LUXE Studio', 240.00, NULL, 35, '{"S","M","L","XL"}', '{"Stone","Black"}', 4.9, 110, false),
('p14', 'cat_men', 'Pleated Designer Chinos', 'designer-chinos', 'A voluminous fit for the modern individual.', 'Aura', 420.00, 550.00, 12, '{"30","32","34"}', '{"Sand"}', 4.6, 9, false),
('p15', 'cat_men', 'Mohair Cardigan', 'mohair-cardigan', 'Textural depth in a relaxed, open-front design.', 'Elite', 680.00, NULL, 10, '{"M","L"}', '{"Gradient Gray"}', 4.8, 14, true),
('p16', 'cat_men', 'Rain-Proof Trench', 'luxury-trench', 'Advanced technical fabric with a classic drape.', 'Essential', 890.00, 1100.00, 15, '{"S","M","L","XL"}', '{"Tan"}', 4.7, 31, false),
('p17', 'cat_men', 'Silk Geometric Tie', 'silk-tie', 'The perfect accent for any LUXE suit.', 'Elite', 150.00, NULL, 100, '{"One Size"}', '{"Royal Blue"}', 4.9, 45, false),
('p18', 'cat_women', 'Ethereal Silk Gown', 'silk-gown', 'A floor-length statement of pure elegance.', 'L''Autre', 1800.00, 2400.00, 8, '{"2","4","6","8"}', '{"Ivory","Gold"}', 5.0, 10, true),
('p19', 'cat_women', 'Cashmere Wrap Cardigan', 'cashmere-wrap', 'Softness that feels like a second skin.', 'Aura', 550.00, NULL, 30, '{"S","M","L"}', '{"Cream","Rose"}', 4.8, 38, true),
('p20', 'cat_women', 'Architectural Wool Blazer', 'womens-blazer', 'Sharp shoulders and a cinched waist for power dressing.', 'LUXE Studio', 780.00, 950.00, 15, '{"2","4","6","8","10"}', '{"Black"}', 4.9, 22, true),
('p21', 'cat_women', 'Plissé Midi Skirt', 'midi-skirt', 'Delicate pleats that dance with every step.', 'Essential', 340.00, NULL, 40, '{"S","M","L"}', '{"Silver","Champagne"}', 4.7, 50, false),
('p22', 'cat_women', 'Hand-Painted Silk Scarf', 'silk-scarf', 'A wearable work of art from our Paris studio.', 'L''Autre', 280.00, 350.00, 100, '{"One Size"}', '{"Multi"}', 4.9, 65, true),
('p23', 'cat_women', 'High-Waist Wide Leg Trousers', 'wide-leg-trousers', 'Lengthening silhouette in a heavy crepe fabric.', 'Elite', 420.00, NULL, 25, '{"2","4","6","8"}', '{"Navy","White"}', 4.6, 17, false),
('p24', 'cat_women', 'Lace Inset Camisole', 'lace-camisole', 'Delicate luxury for layering or lounging.', 'Essential', 180.00, 240.00, 50, '{"XS","S","M","L"}', '{"Black","Nude"}', 4.5, 90, false),
('p25', 'cat_women', 'Double-Faced Wool Coat', 'double-face-coat', 'Two tones of warmth in one exquisite piece.', 'LUXE Atelier', 1500.00, 1900.00, 10, '{"M","L"}', '{"Grey/Blue"}', 5.0, 6, true),
('p26', 'cat_women', 'Structured Satin Top', 'satin-top', 'Sculptural elegance for the minimalist wardrobe.', 'Aura', 290.00, NULL, 35, '{"S","M","L"}', '{"Pearl"}', 4.7, 28, false),
('p27', 'cat_women', 'Asymmetric Knit Dress', 'knit-dress', 'Form-fitting luxury with a unique edge.', 'Elite', 480.00, 600.00, 20, '{"S","M","L"}', '{"Onyx"}', 4.8, 14, false),
('p28', 'cat_women', 'Leather Pencil Skirt', 'leather-pencil-skirt', 'Soft Italian lambskin for an impeccable fit.', 'Heritage', 1100.00, NULL, 5, '{"4","6","8"}', '{"Bordeaux"}', 4.9, 9, false),
('p29', 'cat_women', 'Organza Sleeve Blouse', 'organza-blouse', 'A romantic interplay of volume and transparency.', 'L''Autre', 390.00, 500.00, 18, '{"XS","S","M"}', '{"Black"}', 4.6, 32, false),
('p30', 'cat_women', 'Tweed Heritage Jacket', 'tweed-jacket', 'The classic reimagined with a modern cropped cut.', 'Heritage', 1400.00, NULL, 12, '{"4","6","8","10"}', '{"Blue/White"}', 5.0, 11, true),
('p31', 'cat_women', 'Tiered Cotton Maxi', 'maxi-dress', 'Effortless luxury for tropical escapes.', 'Essential', 450.00, 550.00, 25, '{"S","M","L"}', '{"Sunny Yellow"}', 4.7, 44, false),
('p32', 'cat_women', 'Velvet Bodysuit', 'velvet-bodysuit', 'The perfect foundation for evening layers.', 'Elite', 220.00, NULL, 40, '{"S","M","L"}', '{"Hunter Green"}', 4.5, 29, false),
('p33', 'cat_women', 'Oversized Boyfriend Shirt', 'boyfriend-shirt', 'Borrowed from him, perfected for her.', 'LUXE Studio', 190.00, 260.00, 60, '{"S","M"}', '{"Blue Stripe"}', 4.8, 85, false),
('p34', 'cat_women', 'Sequin Statement Party Dress', 'party-dress', 'Hand-sewn micro sequins for ultimate radiance.', 'Elite', 980.00, NULL, 7, '{"4","6","8"}', '{"Silver"}', 4.9, 13, true),
('p35', 'cat_shoes', 'Polished Calfskin Derby', 'calfskin-derby', 'The definitive formal shoe.', 'Heritage', 650.00, NULL, 20, '{"8","9","10","11","12"}', '{"Ebony"}', 4.9, 42, true),
('p36', 'cat_shoes', 'Minimalist Suede Sneaker', 'suede-sneaker', 'A clean silhouette for luxury everyday wear.', 'LUXE Studio', 420.00, 550.00, 50, '{"7","8","9","10","11","12"}', '{"White","Gray"}', 4.8, 120, true),
('p37', 'cat_shoes', 'Architectural Stiletto', 'stiletto-heel', 'Sculpted for both height and surprising comfort.', 'Elite', 890.00, NULL, 15, '{"5","6","7","8","9"}', '{"Nude Satin"}', 4.9, 18, true),
('p38', 'cat_shoes', 'Hand-Woven Loafer', 'woven-loafer', 'Detailed craftsmanship you can see and feel.', 'LUXE Atelier', 740.00, 900.00, 12, '{"8","9","10","11"}', '{"Tan"}', 4.7, 25, false),
('p39', 'cat_shoes', 'Technical Mesh Runner', 'luxe-runner', 'Innovation meets luxury in this high-performance shoe.', 'Aura', 380.00, NULL, 60, '{"7","8","9","10","11","12"}', '{"Neon/Grey"}', 4.6, 95, false),
('p40', 'cat_shoes', 'Chelsea Boot in Rough Grain', 'chelsea-boot', 'Rugged durability with a refined LUXE finish.', 'Heritage', 720.00, 850.00, 18, '{"9","10","11","12"}', '{"Dark Brown"}', 4.8, 33, false),
('p41', 'cat_shoes', 'Velvet Slipper with Embroidery', 'evening-slipper', 'The ultimate piece for at-home elegance.', 'Elite', 480.00, NULL, 15, '{"8","9","10","11"}', '{"Navy"}', 4.9, 14, false),
('p42', 'cat_shoes', 'Leather Top-Handle Bag', 'top-handle-bag', 'Timeless structure for the modern professional.', 'L''Autre', 2100.00, 2800.00, 5, '{"One Size"}', '{"Burgundy"}', 5.0, 7, true),
('p43', 'cat_shoes', 'Minimalist Leather Cardholder', 'cardholder', 'Carry only the essentials in pure luxury.', 'Essential', 120.00, 160.00, 200, '{"One Size"}', '{"Black","Cognac"}', 4.8, 150, false),
('p44', 'cat_shoes', 'Suede Desert Boot', 'desert-boot', 'The classic silhouette reimagined for the modern world.', 'Heritage', 520.00, NULL, 25, '{"8","9","10","11"}', '{"Sand"}', 4.6, 29, false),
('p45', 'cat_shoes', 'Studded Biker Boot', 'biker-boot', 'Edge meets elegance in this heavy-duty pair.', 'Aura', 950.00, 1200.00, 10, '{"6","7","8","9"}', '{"Noir"}', 4.7, 12, false),
('p46', 'cat_shoes', 'Snake-Effect Clutch', 'clutch-bag', 'A bold statement piece to complete your look.', 'Elite', 890.00, NULL, 6, '{"One Size"}', '{"Emerald"}', 4.9, 5, true),
('p47', 'cat_shoes', 'Shearling Lined Winter Boot', 'shearling-boot', 'Brave the elements without sacrificing style.', 'Aura', 1100.00, 1400.00, 15, '{"7","8","9","10"}', '{"Beige"}', 4.8, 8, false),
('p48', 'cat_shoes', 'Monogram Leather Belt', 'leather-belt', 'Subtle branding on a strap of perfect calfskin.', 'Essential', 350.00, NULL, 100, '{"30","32","34","36"}', '{"Black"}', 4.7, 56, false),
('p49', 'cat_shoes', 'Espadrille Wedges', 'wedge-sandal', 'The perfect height for summer afternoons.', 'L''Autre', 420.00, 550.00, 30, '{"5","6","7","8"}', '{"Oatmeal"}', 4.5, 21, false),
('p50', 'cat_shoes', 'Exotic Skin Oxford', 'skin-oxford', 'Rare materials for a truly unique profile.', 'LUXE Atelier', 3200.00, NULL, 2, '{"9","10"}', '{"Mahogany"}', 5.0, 3, true),
('p51', 'cat_shoes', 'Canvas Weekend Tote', 'weekend-tote', 'Durable canvas met with leather reinforcement.', 'Essential', 580.00, 750.00, 20, '{"One Size"}', '{"Natural/Tan"}', 4.7, 34, false);

-- =============================================
-- 7. SEED IMAGES — 4 per product (fallback cascade)
-- sort_order 0 = primary, 1-3 = fallback carousel
-- =============================================

-- MEN'S PRODUCTS (p1–p17)
INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
-- p1 Luxury Silk Blouson
('p1', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1000&q=80', true, 0),
('p1', 'https://images.unsplash.com/photo-1507679799987-c73774586594?w=1000&q=80', false, 1),
('p1', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=1000&q=80', false, 2),
('p1', 'https://images.unsplash.com/photo-1516826957135-700d500029e8?w=1000&q=80', false, 3),

-- p2 Architectural Wool Coat
('p2', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&q=80', true, 0),
('p2', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80', false, 1),
('p2', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&q=80', false, 2),
('p2', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1000&q=80', false, 3),

-- p3 Suede Overcoat
('p3', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&q=80', true, 0),
('p3', 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1000&q=80', false, 1),
('p3', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80', false, 2),
('p3', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1000&q=80', false, 3),

-- p4 Technical Knit Sweater
('p4', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&q=80', true, 0),
('p4', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1000&q=80', false, 1),
('p4', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80', false, 2),
('p4', 'https://images.unsplash.com/photo-1516826957135-700d500029e8?w=1000&q=80', false, 3),

-- p5 Egyptian Cotton Shirt
('p5', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000&q=80', true, 0),
('p5', 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=1000&q=80', false, 1),
('p5', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000&q=80', false, 2),
('p5', 'https://images.unsplash.com/photo-1594938298603-b8246cd6be97?w=1000&q=80', false, 3),

-- p6 Selvedge Denim
('p6', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000&q=80', true, 0),
('p6', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1000&q=80', false, 1),
('p6', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=80', false, 2),
('p6', 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=1000&q=80', false, 3),

-- p7 Leather Jacket
('p7', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&q=80', true, 0),
('p7', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1000&q=80', false, 1),
('p7', 'https://images.unsplash.com/photo-1591213954196-2d0ccb3f8d4c?w=1000&q=80', false, 2),
('p7', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=80', false, 3),

-- p8 Velvet Blazer
('p8', 'https://images.unsplash.com/photo-1507679799987-c73774586594?w=1000&q=80', true, 0),
('p8', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=1000&q=80', false, 1),
('p8', 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=1000&q=80', false, 2),
('p8', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1000&q=80', false, 3),

-- p9 Merino Silk Polo
('p9', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80', true, 0),
('p9', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80', false, 1),
('p9', 'https://images.unsplash.com/photo-1494793523497-ed02a80a4666?w=1000&q=80', false, 2),
('p9', 'https://images.unsplash.com/photo-1516826957135-700d500029e8?w=1000&q=80', false, 3),

-- p10 Linen Trousers
('p10', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000&q=80', true, 0),
('p10', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&q=80', false, 1),
('p10', 'https://images.unsplash.com/photo-1539106602056-82098605397a?w=1000&q=80', false, 2),
('p10', 'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=1000&q=80', false, 3),

-- p11 Silk-Cashmere Scarf
('p11', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1000&q=80', true, 0),
('p11', 'https://images.unsplash.com/photo-1601925228008-74b75ec7b3d9?w=1000&q=80', false, 1),
('p11', 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=1000&q=80', false, 2),
('p11', 'https://images.unsplash.com/photo-1608748010899-18f300247112?w=1000&q=80', false, 3),

-- p12 Guayabera Shirt
('p12', 'https://images.unsplash.com/photo-1598961942613-ba897716406b?w=1000&q=80', true, 0),
('p12', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000&q=80', false, 1),
('p12', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000&q=80', false, 2),
('p12', 'https://images.unsplash.com/photo-1594938298603-b8246cd6be97?w=1000&q=80', false, 3),

-- p13 Heavyweight Terry Hoodie
('p13', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80', true, 0),
('p13', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', false, 1),
('p13', 'https://images.unsplash.com/photo-1519278409-1f56ab241a51?w=1000&q=80', false, 2),
('p13', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1000&q=80', false, 3),

-- p14 Designer Chinos
('p14', 'https://images.unsplash.com/photo-1539106602056-82098605397a?w=1000&q=80', true, 0),
('p14', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&q=80', false, 1),
('p14', 'https://images.unsplash.com/photo-1587891879-9b24d7282af9?w=1000&q=80', false, 2),
('p14', 'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=1000&q=80', false, 3),

-- p15 Mohair Cardigan
('p15', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1000&q=80', true, 0),
('p15', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80', false, 1),
('p15', 'https://images.unsplash.com/photo-1516826957135-700d500029e8?w=1000&q=80', false, 2),
('p15', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1000&q=80', false, 3),

-- p16 Rain-Proof Trench
('p16', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80', true, 0),
('p16', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&q=80', false, 1),
('p16', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&q=80', false, 2),
('p16', 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1000&q=80', false, 3),

-- p17 Silk Tie
('p17', 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=1000&q=80', true, 0),
('p17', 'https://images.unsplash.com/photo-1507679799987-c73774586594?w=1000&q=80', false, 1),
('p17', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1000&q=80', false, 2),
('p17', 'https://images.unsplash.com/photo-1601925228008-74b75ec7b3d9?w=1000&q=80', false, 3),

-- WOMEN'S PRODUCTS (p18–p34)
-- p18 Silk Gown
('p18', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&q=80', true, 0),
('p18', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&q=80', false, 1),
('p18', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 2),
('p18', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80', false, 3),

-- p19 Cashmere Wrap Cardigan
('p19', 'https://images.unsplash.com/photo-1481824429379-07aa5e5b0739?w=1000&q=80', true, 0),
('p19', 'https://images.unsplash.com/photo-1551163949-3f6a855e117e?w=1000&q=80', false, 1),
('p19', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1000&q=80', false, 2),
('p19', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1000&q=80', false, 3),

-- p20 Womens Blazer
('p20', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=1000&q=80', true, 0),
('p20', 'https://images.unsplash.com/photo-1539008835158-9683638bd76e?w=1000&q=80', false, 1),
('p20', 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=1000&q=80', false, 2),
('p20', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 3),

-- p21 Midi Skirt
('p21', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&q=80', true, 0),
('p21', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&q=80', false, 1),
('p21', 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=1000&q=80', false, 2),
('p21', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1000&q=80', false, 3),

-- p22 Silk Scarf
('p22', 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=1000&q=80', true, 0),
('p22', 'https://images.unsplash.com/photo-1601925228008-74b75ec7b3d9?w=1000&q=80', false, 1),
('p22', 'https://images.unsplash.com/photo-1608748010899-18f300247112?w=1000&q=80', false, 2),
('p22', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1000&q=80', false, 3),

-- p23 Wide Leg Trousers
('p23', 'https://images.unsplash.com/photo-1509556756506-3065b2e5644d?w=1000&q=80', true, 0),
('p23', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&q=80', false, 1),
('p23', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000&q=80', false, 2),
('p23', 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=1000&q=80', false, 3),

-- p24 Lace Camisole
('p24', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80', true, 0),
('p24', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 1),
('p24', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1000&q=80', false, 2),
('p24', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1000&q=80', false, 3),

-- p25 Double-Faced Wool Coat
('p25', 'https://images.unsplash.com/photo-1539106602056-82098605397a?w=1000&q=80', true, 0),
('p25', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=1000&q=80', false, 1),
('p25', 'https://images.unsplash.com/photo-1539008835158-9683638bd76e?w=1000&q=80', false, 2),
('p25', 'https://images.unsplash.com/photo-1590400238767-e0cf27433c36?w=1000&q=80', false, 3),

-- p26 Satin Top
('p26', 'https://images.unsplash.com/photo-1551163949-3f6a855e117e?w=1000&q=80', true, 0),
('p26', 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=1000&q=80', false, 1),
('p26', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80', false, 2),
('p26', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 3),

-- p27 Knit Dress
('p27', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&q=80', true, 0),
('p27', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&q=80', false, 1),
('p27', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1000&q=80', false, 2),
('p27', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&q=80', false, 3),

-- p28 Leather Pencil Skirt
('p28', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1000&q=80', true, 0),
('p28', 'https://images.unsplash.com/photo-1509556756506-3065b2e5644d?w=1000&q=80', false, 1),
('p28', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&q=80', false, 2),
('p28', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&q=80', false, 3),

-- p29 Organza Blouse
('p29', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', true, 0),
('p29', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=1000&q=80', false, 1),
('p29', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80', false, 2),
('p29', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1000&q=80', false, 3),

-- p30 Tweed Jacket
('p30', 'https://images.unsplash.com/photo-1539008835158-9683638bd76e?w=1000&q=80', true, 0),
('p30', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=1000&q=80', false, 1),
('p30', 'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=1000&q=80', false, 2),
('p30', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 3),

-- p31 Tiered Maxi
('p31', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&q=80', true, 0),
('p31', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&q=80', false, 1),
('p31', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&q=80', false, 2),
('p31', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1000&q=80', false, 3),

-- p32 Velvet Bodysuit
('p32', 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1000&q=80', true, 0),
('p32', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 1),
('p32', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&q=80', false, 2),
('p32', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80', false, 3),

-- p33 Boyfriend Shirt
('p33', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1000&q=80', true, 0),
('p33', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1000&q=80', false, 1),
('p33', 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=1000&q=80', false, 2),
('p33', 'https://images.unsplash.com/photo-1551163949-3f6a855e117e?w=1000&q=80', false, 3),

-- p34 Party Dress
('p34', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&q=80', true, 0),
('p34', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&q=80', false, 1),
('p34', 'https://images.unsplash.com/photo-1590400238767-e0cf27433c36?w=1000&q=80', false, 2),
('p34', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', false, 3),

-- SHOES & ACCESSORIES (p35–p51)
-- p35 Calfskin Derby
('p35', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1000&q=80', true, 0),
('p35', 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=1000&q=80', false, 1),
('p35', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', false, 2),
('p35', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', false, 3),

-- p36 Suede Sneaker
('p36', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&q=80', true, 0),
('p36', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', false, 1),
('p36', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80', false, 2),
('p36', 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=1000&q=80', false, 3),

-- p37 Architectural Stiletto
('p37', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1000&q=80', true, 0),
('p37', 'https://images.unsplash.com/photo-1596940922040-5d7f45eed15e?w=1000&q=80', false, 1),
('p37', 'https://images.unsplash.com/photo-1509451580-25f93d4b48aa?w=1000&q=80', false, 2),
('p37', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80', false, 3),

-- p38 Hand-Woven Loafer
('p38', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=1000&q=80', true, 0),
('p38', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1000&q=80', false, 1),
('p38', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', false, 2),
('p38', 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=1000&q=80', false, 3),

-- p39 Technical Mesh Runner
('p39', 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=1000&q=80', true, 0),
('p39', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', false, 1),
('p39', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80', false, 2),
('p39', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&q=80', false, 3),

-- p40 Chelsea Boot
('p40', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', true, 0),
('p40', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80', false, 1),
('p40', 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=1000&q=80', false, 2),
('p40', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=1000&q=80', false, 3),

-- p41 Velvet Slipper
('p41', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80', true, 0),
('p41', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1000&q=80', false, 1),
('p41', 'https://images.unsplash.com/photo-1596940922040-5d7f45eed15e?w=1000&q=80', false, 2),
('p41', 'https://images.unsplash.com/photo-1509451580-25f93d4b48aa?w=1000&q=80', false, 3),

-- p42 Leather Top-Handle Bag
('p42', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80', true, 0),
('p42', 'https://images.unsplash.com/photo-1566150905458-1bf1fd113962?w=1000&q=80', false, 1),
('p42', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80', false, 2),
('p42', 'https://images.unsplash.com/photo-1544816153-199d821b127e?w=1000&q=80', false, 3),

-- p43 Leather Cardholder
('p43', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000&q=80', true, 0),
('p43', 'https://images.unsplash.com/photo-1624222247344-550fb8ec5521?w=1000&q=80', false, 1),
('p43', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80', false, 2),
('p43', 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=1000&q=80', false, 3),

-- p44 Suede Desert Boot
('p44', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', true, 0),
('p44', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', false, 1),
('p44', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=1000&q=80', false, 2),
('p44', 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=1000&q=80', false, 3),

-- p45 Studded Biker Boot
('p45', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1000&q=80', true, 0),
('p45', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80', false, 1),
('p45', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', false, 2),
('p45', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', false, 3),

-- p46 Snake-Effect Clutch
('p46', 'https://images.unsplash.com/photo-1566150905458-1bf1fd113962?w=1000&q=80', true, 0),
('p46', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80', false, 1),
('p46', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80', false, 2),
('p46', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&q=80', false, 3),

-- p47 Shearling Boot
('p47', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80', true, 0),
('p47', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1000&q=80', false, 1),
('p47', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', false, 2),
('p47', 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=1000&q=80', false, 3),

-- p48 Monogram Leather Belt
('p48', 'https://images.unsplash.com/photo-1624222247344-550fb8ec5521?w=1000&q=80', true, 0),
('p48', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000&q=80', false, 1),
('p48', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80', false, 2),
('p48', 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=1000&q=80', false, 3),

-- p49 Espadrille Wedges
('p49', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&q=80', true, 0),
('p49', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1000&q=80', false, 1),
('p49', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80', false, 2),
('p49', 'https://images.unsplash.com/photo-1509451580-25f93d4b48aa?w=1000&q=80', false, 3),

-- p50 Exotic Skin Oxford
('p50', 'https://images.unsplash.com/photo-1560343090-3e284f18d53d?w=1000&q=80', true, 0),
('p50', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1000&q=80', false, 1),
('p50', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=1000&q=80', false, 2),
('p50', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80', false, 3),

-- p51 Canvas Weekend Tote
('p51', 'https://images.unsplash.com/photo-1544816153-199d821b127e?w=1000&q=80', true, 0),
('p51', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80', false, 1),
('p51', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80', false, 2),
('p51', 'https://images.unsplash.com/photo-1566150905458-1bf1fd113962?w=1000&q=80', false, 3);

-- =============================================
-- FINAL VERIFICATION
-- =============================================
SELECT count(*) AS total_products FROM products;
SELECT count(*) AS total_images FROM product_images;
SELECT count(*) AS total_categories FROM categories;
SELECT count(*) AS images_per_product_avg FROM product_images;
