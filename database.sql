-- ======================================================
-- HAMZURE MASTER DATABASE SETUP (LOCAL SOURCE)
-- ======================================================

-- 1. SAFE CLEANUP
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.reduce_stock_on_order();

-- 2. CREATE TABLES
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT DEFAULT 'HAMZURE',
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  stock_quantity INTEGER DEFAULT 100,
  is_featured BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL
);

-- 3. SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "P_Read" ON products FOR SELECT USING (true);
CREATE POLICY "I_Read" ON product_images FOR SELECT USING (true);
CREATE POLICY "C_Read" ON categories FOR SELECT USING (true);
CREATE POLICY "U_All" ON users FOR ALL TO authenticated USING (auth.uid() = id);

-- Admin Master Policies (Save this for Admin Portal)
CREATE POLICY "Admin_P" ON products FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin_I" ON product_images FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin_C" ON categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- 4. AUTH SYNC
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, role)
  VALUES (new.id, new.email, split_part(new.email, '@', 1), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. DATA SEED (51 PRODUCTS)
INSERT INTO categories (id, name, slug, image_url) VALUES 
('cat_men', 'Men', 'men', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1000'),
('cat_women', 'Women', 'women', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000'),
('cat_shoes', 'Shoes', 'shoes', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000');

DO $$
DECLARE
    m_i TEXT[] := ARRAY['https://images.unsplash.com/photo-1617137984095-74e4e5e3613f','https://images.unsplash.com/photo-1490578474895-699cd4e2cf59','https://images.unsplash.com/photo-1617127365659-c47fa864d8bc','https://images.unsplash.com/photo-1550246140-5119ae4790b8','https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6'];
    w_i TEXT[] := ARRAY['https://images.unsplash.com/photo-1490481651871-ab68de25d43d','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f','https://images.unsplash.com/photo-1483985988355-763728e1935b','https://images.unsplash.com/photo-1558769132-cb1aea458c5e','https://images.unsplash.com/photo-1539008835158-9683638bd76e'];
    s_i TEXT[] := ARRAY['https://images.unsplash.com/photo-1560769629-975ec94e6a86','https://images.unsplash.com/photo-1549298916-b41d501d3772','https://images.unsplash.com/photo-1542291026-7eec264c27ff','https://images.unsplash.com/photo-1608231387042-66d1773070a5','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a'];
    p_id TEXT;
BEGIN
    FOR i IN 1..17 LOOP
        p_id := 'm' || i;
        INSERT INTO products (id, category_id, name, slug, price, is_featured) VALUES (p_id, 'cat_men', 'Hamzure Men Piece ' || i, 'm-'||i, (300+i*10), true);
        FOR j IN 0..4 LOOP INSERT INTO product_images (product_id, url, sort_order, is_primary) VALUES (p_id, m_i[((i+j-1)%5)+1]||'?w=800&q=80', j, (j=0)); END LOOP;
        
        p_id := 'w' || i;
        INSERT INTO products (id, category_id, name, slug, price, is_featured) VALUES (p_id, 'cat_women', 'Hamzure Women Gown ' || i, 'w-'||i, (400+i*20), true);
        FOR j IN 0..4 LOOP INSERT INTO product_images (product_id, url, sort_order, is_primary) VALUES (p_id, w_i[((i+j-1)%5)+1]||'?w=800&q=80', j, (j=0)); END LOOP;

        p_id := 's' || i;
        INSERT INTO products (id, category_id, name, slug, price, is_featured) VALUES (p_id, 'cat_shoes', 'Hamzure Heritage Shoe ' || i, 's-'||i, (200+i*15), true);
        FOR j IN 0..4 LOOP INSERT INTO product_images (product_id, url, sort_order, is_primary) VALUES (p_id, s_i[((i+j-1)%5)+1]||'?w=800&q=80', j, (j=0)); END LOOP;
    END LOOP;
END $$;
