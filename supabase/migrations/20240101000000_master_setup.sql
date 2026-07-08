-- ============================================================
-- HAMZURE LUXURY PLATFORM — MASTER SETUP (v3.0 FINAL)
-- Merges all 6 SQL scripts into one definitive file.
-- Run this in Supabase SQL Editor > New Query
-- ============================================================


-- ============================================================
-- SECTION 1: SAFE CLEANUP
-- ============================================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.reduce_stock_on_order();


-- ============================================================
-- SECTION 2: CREATE TABLES
-- ============================================================

CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE products (
  id               TEXT PRIMARY KEY,
  category_id      TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  brand            TEXT DEFAULT 'HAMZURE',
  description      TEXT,
  price            DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  sizes            TEXT[] DEFAULT ARRAY['S','M','L','XL'],
  colors           TEXT[] DEFAULT ARRAY['Black','White'],
  stock_quantity   INTEGER DEFAULT 50,
  is_featured      BOOLEAN DEFAULT true,
  is_active        BOOLEAN DEFAULT true,
  rating           DECIMAL(3,2) DEFAULT 4.5,
  review_count     INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  name       TEXT DEFAULT 'Product View',
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      TEXT NOT NULL,
  first_name TEXT DEFAULT '',
  last_name  TEXT DEFAULT '',
  phone      TEXT,
  role       TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  country         TEXT DEFAULT 'Pakistan',
  zip_code        TEXT,
  total           DECIMAL(12,2) NOT NULL,
  subtotal        DECIMAL(12,2),
  shipping_cost   DECIMAL(12,2) DEFAULT 0,
  tax             DECIMAL(12,2) DEFAULT 0,
  payment_method  TEXT DEFAULT 'card',
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id         TEXT REFERENCES products(id),
  product_name       TEXT,
  size               TEXT,
  color              TEXT,
  quantity           INTEGER NOT NULL,
  price_at_purchase  DECIMAL(12,2) NOT NULL
);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront
CREATE POLICY "products_public_read"       ON products       FOR SELECT USING (true);
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (true);
CREATE POLICY "categories_public_read"     ON categories     FOR SELECT USING (true);

-- User-level access
CREATE POLICY "users_self_insert"  ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_self_update"  ON users FOR UPDATE USING     (auth.uid() = id);
CREATE POLICY "users_public_read"  ON users FOR SELECT USING     (true);

-- Order access
CREATE POLICY "orders_self_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_self_read"   ON orders FOR SELECT USING     (auth.uid() = user_id);
CREATE POLICY "order_items_self_insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_self_read"   ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- Notifications
CREATE POLICY "notifications_self_read"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_self_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Admin bypass (allows admins to manage all data)
CREATE POLICY "admin_products_all"       ON products       FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_product_images_all" ON product_images FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_categories_all"     ON categories     FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_orders_all"         ON orders         FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_order_items_all"    ON order_items    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_users_all"          ON users          FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- SECTION 4: AUTH TRIGGER (Auto-creates user profile)
-- ============================================================

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


-- ============================================================
-- SECTION 5: CATEGORY SEED
-- ============================================================

INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
('cat_men',   'Men',   'men',   'Tailored luxury for the modern gentleman.',   'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1000', 1),
('cat_women', 'Women', 'women', 'Effortless elegance for the discerning woman.','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000', 2),
('cat_shoes', 'Shoes', 'shoes', 'Heritage footwear crafted for every occasion.', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000', 3);


-- ============================================================
-- SECTION 6: 51 LUXURY PRODUCTS WITH FULL DETAILS
-- ============================================================

INSERT INTO products (id, category_id, name, slug, brand, description, price, compare_at_price, sizes, colors, stock_quantity, is_featured, is_active, rating, review_count)
VALUES
-- ── MEN'S COLLECTION (17 items) ──
('m1',  'cat_men', 'Oxford Slim Blazer',     'm-1',  'HAMZURE', 'Hand-tailored in Italian wool. A sharp, structured silhouette designed for the modern gentleman.', 450, 580, ARRAY['S','M','L','XL'], ARRAY['Charcoal','Navy','Espresso'], 10, true, true, 4.8, 124),
('m2',  'cat_men', 'Heritage Wool Coat',     'm-2',  'HAMZURE', 'Double-faced merino wool coat with a clean dropped shoulder. Warmth without compromise.', 850, 1100, ARRAY['S','M','L','XL'], ARRAY['Camel','Midnight','Stone'], 5, true, true, 4.9, 89),
('m3',  'cat_men', 'Midnight Tuxedo',        'm-3',  'HAMZURE', 'Peak lapel evening tuxedo cut from premium wool-silk blend. The pinnacle of formal dressing.', 1200, null, ARRAY['S','M','L','XL'], ARRAY['Black','Midnight Blue'], 3, true, true, 5.0, 56),
('m4',  'cat_men', 'Savile Row Suit',        'm-4',  'HAMZURE', 'Full-canvas construction meets razor-sharp tailoring. Handcrafted with British tweed.', 1500, null, ARRAY['S','M','L','XL'], ARRAY['Charcoal','Brown Herringbone','Grey'], 4, true, true, 4.9, 72),
('m5',  'cat_men', 'Classic Trench Coat',    'm-5',  'HAMZURE', 'The timeless trench, revisited. Waterproof gabardine with horn buttons and a belted waist.', 750, 950, ARRAY['S','M','L','XL'], ARRAY['Khaki','Black','Tan'], 8, true, true, 4.7, 98),
('m6',  'cat_men', 'Italian Knit Sweater',   'm-6',  'HAMZURE', 'Fine-gauge merino knit from the mills of Biella. Effortlessly elegant for any occasion.', 320, null, ARRAY['S','M','L','XL'], ARRAY['Ivory','Forest Green','Burgundy'], 12, true, true, 4.6, 145),
('m7',  'cat_men', 'Silk Evening Shirt',     'm-7',  'HAMZURE', 'Woven from 100% Mulberry silk. The shirt that elevates every black-tie occasion.', 280, 380, ARRAY['S','M','L','XL'], ARRAY['White','Pale Blue','Champagne'], 15, true, true, 4.7, 167),
('m8',  'cat_men', 'Modern Slim Chino',      'm-8',  'HAMZURE', 'Slim-cut chino with a stretch-comfort twill. Sophisticated enough for boardrooms, easy for weekends.', 190, null, ARRAY['28','30','32','34','36'], ARRAY['Sand','Slate','Olive'], 20, true, true, 4.5, 203),
('m9',  'cat_men', 'Cashmere Cardigan',      'm-9',  'HAMZURE', 'Grade-A Mongolian cashmere in a relaxed ribbed cut. Softer than anything you have worn before.', 580, 750, ARRAY['S','M','L','XL'], ARRAY['Oatmeal','Navy','Blush'], 6, true, true, 4.8, 91),
('m10', 'cat_men', 'Urban Bomber Jacket',    'm-10', 'HAMZURE', 'Satin-lined nylon shell with ribbed cuffs. Luxury street-wear for the discerning man.', 440, null, ARRAY['S','M','L','XL'], ARRAY['Onyx','Olive Drab','Russet'], 9, true, true, 4.6, 112),
('m11', 'cat_men', 'Alpine Parka',           'm-11', 'HAMZURE', 'Down-filled technical parka with a water-resistant shell. Built for extreme style in any climate.', 980, 1200, ARRAY['S','M','L','XL'], ARRAY['Forest','Black','Copper'], 4, true, true, 4.8, 67),
('m12', 'cat_men', 'Minimalist Polo',        'm-12', 'HAMZURE', 'Pique-knit mercerised cotton polo with ribbed collar. Clean lines, maximum impact.', 140, null, ARRAY['S','M','L','XL'], ARRAY['Ecru','Sky','Port'], 25, true, true, 4.4, 289),
('m13', 'cat_men', 'Double Breasted Vest',   'm-13', 'HAMZURE', 'Six-button double-breasted waistcoat in fine wool. The perfect pairing for your dress trousers.', 220, null, ARRAY['S','M','L','XL'], ARRAY['Charcoal','Burgundy','Black'], 7, true, true, 4.7, 78),
('m14', 'cat_men', 'Checked Braces Blazer',  'm-14', 'HAMZURE', 'Prince of Wales check blazer with contrast braces. Refined British country style for the city.', 620, 780, ARRAY['S','M','L','XL'], ARRAY['Brown Check','Grey Check','Navy Check'], 3, true, true, 4.9, 43),
('m15', 'cat_men', 'Satin Peak Lapel Suit',  'm-15', 'HAMZURE', 'Tonal satin peak lapels on a midnight wool base. Designed to be noticed without saying a word.', 1350, null, ARRAY['S','M','L','XL'], ARRAY['Midnight','Black','Steel Blue'], 2, true, true, 5.0, 38),
('m16', 'cat_men', 'Corduroy Overshirt',     'm-16', 'HAMZURE', 'Heavyweight corduroy shacket with hidden button placket. The perfect transitional layer.', 180, 240, ARRAY['S','M','L','XL'], ARRAY['Rust','Forest','Camel'], 11, true, true, 4.5, 134),
('m17', 'cat_men', 'Linen Summer Blazer',    'm-17', 'HAMZURE', 'Unlined washed linen blazer with patch pockets. Effortlessly relaxed for warm-weather occasions.', 380, null, ARRAY['S','M','L','XL'], ARRAY['Ivory','Sky Blue','Sand'], 9, true, true, 4.6, 99),

-- ── WOMEN'S COLLECTION (17 items) ──
('w1',  'cat_women', 'Silk Evening Gown',        'w-1',  'HAMZURE', 'Floor-length bias-cut gown in pure Charmeuse silk. A masterpiece of feminine construction.', 950, 1200, ARRAY['XS','S','M','L'], ARRAY['Champagne','Midnight','Rose'], 8, true, true, 4.9, 156),
('w2',  'cat_women', 'Velvet Cocktail Dress',    'w-2',  'HAMZURE', 'Stretch-velvet sheath with a fluted hem. Opulent texture meets modern silhouette.', 650, 820, ARRAY['XS','S','M','L'], ARRAY['Burgundy','Forest Green','Navy'], 12, true, true, 4.8, 134),
('w3',  'cat_women', 'Cashmere Wrap Coat',       'w-3',  'HAMZURE', 'Oversized double-cashmere wrap coat with a self-tie belt. Warmth embodied as pure luxury.', 1100, 1400, ARRAY['XS','S','M','L'], ARRAY['Camel','Ivory','Blush'], 4, true, true, 4.9, 89),
('w4',  'cat_women', 'Floral Satin Slip Dress',  'w-4',  'HAMZURE', 'Feminine, fluid, and powerful. Printed Charmeuse silk with adjustable straps.', 420, null, ARRAY['XS','S','M','L'], ARRAY['Floral Print','Blush','Ivory'], 10, true, true, 4.7, 178),
('w5',  'cat_women', 'Embroidered Gala Robe',    'w-5',  'HAMZURE', 'Hand-embroidered floral motifs on duchess satin base. Crafted for the grandest of occasions.', 2400, null, ARRAY['XS','S','M','L'], ARRAY['Gold','Ivory','Black'], 2, true, true, 5.0, 29),
('w6',  'cat_women', 'Merino Knit Co-ord Set',   'w-6',  'HAMZURE', 'Matching fine-knit crop top and wide-leg trousers. The co-ord that commands a room.', 480, 600, ARRAY['XS','S','M','L'], ARRAY['Ecru','Taupe','Blush'], 7, true, true, 4.6, 112),
('w7',  'cat_women', 'Tailored Ivory Blazer',    'w-7',  'HAMZURE', 'Power-shouldered single-breasted blazer in double-faced wool. Masculine structure, feminine grace.', 550, null, ARRAY['XS','S','M','L'], ARRAY['Ivory','Chalk','Black'], 6, true, true, 4.8, 95),
('w8',  'cat_women', 'Gold Belt Mini Dress',     'w-8',  'HAMZURE', 'Structured ponte-knit mini with a sculpted gold chain belt. Day-to-night without a second look.', 890, 1100, ARRAY['XS','S','M','L'], ARRAY['Black','Slate','Espresso'], 5, true, true, 4.7, 88),
('w9',  'cat_women', 'Chiffon Layered Skirt',    'w-9',  'HAMZURE', 'Multi-tiered georgette chiffon in a sweeping, movement-driven silhouette.', 340, null, ARRAY['XS','S','M','L'], ARRAY['Lavender','Ivory','Sage'], 9, true, true, 4.5, 143),
('w10', 'cat_women', 'Dramatic Opera Cloak',     'w-10', 'HAMZURE', 'Full-length opera cape in heritage wool. The statement piece every wardrobe demands.', 1600, null, ARRAY['XS','S','M','L'], ARRAY['Black','Scarlet','Midnight Blue'], 3, true, true, 5.0, 41),
('w11', 'cat_women', 'High-Neck Lace Blouse',    'w-11', 'HAMZURE', 'Victorian-inspired high-neck blouse in Chantilly lace. Romantic luxury refined for today.', 290, 380, ARRAY['XS','S','M','L'], ARRAY['Ivory','Black','Blush'], 14, true, true, 4.6, 167),
('w12', 'cat_women', 'Pleated Midi Dress',       'w-12', 'HAMZURE', 'Accordion-pleated satin midi with a deep V-neckline. Feminine poise in every step you take.', 460, 580, ARRAY['XS','S','M','L'], ARRAY['Copper','Silver','Navy'], 11, true, true, 4.7, 129),
('w13', 'cat_women', 'Sequined Party Gown',      'w-13', 'HAMZURE', 'Head-to-toe micro-sequin gown with a mermaid hem. Be impossible to ignore tonight.', 1250, 1600, ARRAY['XS','S','M','L'], ARRAY['Gold','Silver','Black'], 4, true, true, 4.9, 62),
('w14', 'cat_women', 'Quilted Winter Coat',      'w-14', 'HAMZURE', 'Channel-quilted down coat with a wool-cashmere exterior. British warmth, Italian soul.', 880, 1100, ARRAY['XS','S','M','L'], ARRAY['Cocoa','Black','Blush'], 6, true, true, 4.8, 77),
('w15', 'cat_women', 'Structured Corset Top',    'w-15', 'HAMZURE', 'Boned satin corset top with heritage stitching. A celebration of the feminine form.', 380, null, ARRAY['XS','S','M','L'], ARRAY['Black','Ivory','Champagne'], 8, true, true, 4.7, 103),
('w16', 'cat_women', 'Minimalist Sheath Dress',  'w-16', 'HAMZURE', 'Clean-cut crepe sheath with a subtle back slit. Supreme comfort. Zero compromises.', 520, 680, ARRAY['XS','S','M','L'], ARRAY['Black','Ivory','Caramel'], 10, true, true, 4.6, 118),
('w17', 'cat_women', 'Bohemian Silk Maxi',       'w-17', 'HAMZURE', 'Free-flowing printed silk maxi with a drawstring waist. Effortless beauty, every day.', 740, 920, ARRAY['XS','S','M','L'], ARRAY['Paisley Print','Floral','Geometric'], 5, true, true, 4.7, 86),

-- ── SHOE COLLECTION (17 items) ──
('s1',  'cat_shoes', 'Patina Leather Loafer',    's-1',  'HAMZURE', 'Hand-burnished calfskin with a distinctive patina finish. Italian craftsmanship at its very peak.', 350, 450, ARRAY['7','8','9','10','11','12'], ARRAY['Cognac','Black','Dark Tan'], 15, true, true, 4.8, 189),
('s2',  'cat_shoes', 'Classic Brogue Oxford',    's-2',  'HAMZURE', 'Full-brogue wingtip in Scotch grain leather. The quintessential British gentleman''s shoe.', 450, 580, ARRAY['7','8','9','10','11','12'], ARRAY['Dark Brown','Black','Burgundy'], 7, true, true, 4.9, 134),
('s3',  'cat_shoes', 'Grand Prix Sneaker',       's-3',  'HAMZURE', 'Tooled leather low-top with a cupsole. Where motorsport meets Milanese elegance.', 290, null, ARRAY['7','8','9','10','11','12'], ARRAY['White','Black','Ecru'], 12, true, true, 4.6, 212),
('s4',  'cat_shoes', 'Velvet Evening Slipper',   's-4',  'HAMZURE', 'Embroidered velvet slipper with a gold chain ornament. Your most effortless evening shoe.', 420, null, ARRAY['7','8','9','10','11','12'], ARRAY['Midnight Blue','Bordeaux','Black'], 5, true, true, 4.8, 67),
('s5',  'cat_shoes', 'Chelsea Suede Boot',       's-5',  'HAMZURE', 'Pull-on suede Chelsea in a sleek square-toe cut. The one boot you will reach for every day.', 480, 620, ARRAY['7','8','9','10','11','12'], ARRAY['Tan','Chocolate','Black'], 8, true, true, 4.7, 156),
('s6',  'cat_shoes', 'Midnight Monk Strap',      's-6',  'HAMZURE', 'Double monk-strap in mirror-polished calf leather. The pinnacle of business-formal footwear.', 520, null, ARRAY['7','8','9','10','11','12'], ARRAY['Black','Dark Brown','Oxblood'], 6, true, true, 4.9, 98),
('s7',  'cat_shoes', 'Italian Derby Shoe',       's-7',  'HAMZURE', 'Open-laced derby in buttery smooth nappa leather. Understated Italian school—perfectly executed.', 390, null, ARRAY['7','8','9','10','11','12'], ARRAY['Havana','Black','Stone Grey'], 10, true, true, 4.7, 123),
('s8',  'cat_shoes', 'Artisan Leather Sandal',   's-8',  'HAMZURE', 'Hand-stitched leather sandal with gold hardware buckles. Summer luxury, distilled.', 180, null, ARRAY['7','8','9','10','11','12'], ARRAY['Tan','Gold','Natural'], 20, true, true, 4.5, 245),
('s9',  'cat_shoes', 'Heritage Desert Boot',     's-9',  'HAMZURE', 'Crepe-soled suede desert boot in the original silhouette, elevated for Hamzure.', 310, 400, ARRAY['7','8','9','10','11','12'], ARRAY['Sand','Chestnut','Black'], 14, true, true, 4.6, 178),
('s10', 'cat_shoes', 'Modernist Running Shoe',   's-10', 'HAMZURE', 'Technical knit upper on a sculptural foam sole. Athletic heritage, luxury finish.', 260, null, ARRAY['7','8','9','10','11','12'], ARRAY['White/Grey','Black/Gold','Navy/Tan'], 18, true, true, 4.5, 234),
('s11', 'cat_shoes', 'Wingtip Spectator',        's-11', 'HAMZURE', 'Two-tone full-brogue spectator in contrasting calfskin. A shoe for those who appreciate art.', 580, 720, ARRAY['7','8','9','10','11','12'], ARRAY['Black/White','Brown/Beige','Tan/White'], 4, true, true, 4.9, 45),
('s12', 'cat_shoes', 'Double Buckle Monk',       's-12', 'HAMZURE', 'Two wide buckle straps on a chisel-toe last. Sculptural hardware meets refined leather.', 490, null, ARRAY['7','8','9','10','11','12'], ARRAY['Black','Cognac','Antique Brown'], 6, true, true, 4.8, 82),
('s13', 'cat_shoes', 'Sleek Pointed Chelsea',    's-13', 'HAMZURE', 'Razor-thin sole, pointed toe, elasticated sides. The most minimal Chelsea in our collection.', 530, 680, ARRAY['7','8','9','10','11','12'], ARRAY['Matte Black','Oxide Brown','Bordeaux'], 7, true, true, 4.7, 96),
('s14', 'cat_shoes', 'Perforated Driver Shoe',   's-14', 'HAMZURE', 'Driving shoe meets Derby in a perforated calfskin upper. Weekend luxury done right.', 240, null, ARRAY['7','8','9','10','11','12'], ARRAY['Tan','Red','Navy'], 15, true, true, 4.5, 143),
('s15', 'cat_shoes', 'Silk Tassel Loafer',       's-15', 'HAMZURE', 'Hand-trimmed silk tassel loafer in Horween calfskin. A statement of quiet, confident luxury.', 380, 490, ARRAY['7','8','9','10','11','12'], ARRAY['Cognac','Black','Bottle Green'], 11, true, true, 4.7, 109),
('s16', 'cat_shoes', 'Polished Cap Toe Oxford',  's-16', 'HAMZURE', 'Mirror-polished cap-toe in a clean, unadorned silhouette. The Oxford that defines all others.', 460, 580, ARRAY['7','8','9','10','11','12'], ARRAY['Black','Dark Brown','Ox-Blood'], 9, true, true, 4.8, 124),
('s17', 'cat_shoes', 'Canvas Yacht Deck Shoe',   's-17', 'HAMZURE', 'Waxed canvas upper with hand-sewn construction. Built for the open sea. Worn for the city.', 190, null, ARRAY['7','8','9','10','11','12'], ARRAY['Navy/White','Tan/Cream','Ecru/Brown'], 25, true, true, 4.4, 198);


-- ============================================================
-- SECTION 7: HIGH-FASHION GALLERY ENGINE (5 IMAGES PER PRODUCT)
-- ============================================================

DO $$
DECLARE
  m_p TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4357',
    'https://images.unsplash.com/photo-1593032465175-481ac7f402a1',
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59',
    'https://images.unsplash.com/photo-1592862902946-75df497a73eb',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
    'https://images.unsplash.com/photo-1621335829175-95f437384d7c',
    'https://images.unsplash.com/photo-1626497741445-562f92418528',
    'https://images.unsplash.com/photo-1550246140-5119ae4790b8',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'
  ];
  w_p TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1539109132374-34fa92d91295',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
    'https://images.unsplash.com/photo-1518606346214-7294fb8eb12e',
    'https://images.unsplash.com/photo-1624378439674-70618e3ef32f',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923',
    'https://images.unsplash.com/photo-1566206091558-7f218b696731',
    'https://images.unsplash.com/photo-1550630968-0fa19614742a',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0953'
  ];
  s_p TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4',
    'https://images.unsplash.com/photo-1533659011278-297fa1f20b4a',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
    'https://images.unsplash.com/photo-1541176633090-67299ac52573',
    'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3',
    'https://images.unsplash.com/photo-1603191659812-ef9ff634cb3a',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    'https://images.unsplash.com/photo-1621022204556-3f9fe5243166',
    'https://images.unsplash.com/photo-1520639889313-7ef7205bb274',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
  ];
  v_names TEXT[] := ARRAY['Front Perspective', 'Side Detail', 'Rear View', 'Material Close-up', 'Lifestyle Shot'];
  p_id TEXT;
BEGIN
  FOR i IN 1..17 LOOP
    -- MEN
    p_id := 'm' || i;
    FOR j IN 0..4 LOOP
       INSERT INTO public.product_images (product_id, url, name, sort_order, is_primary)
       VALUES (p_id, m_p[((i + j - 1) % 10) + 1] || '?w=1000&auto=format&q=80', v_names[j+1], j, (j = 0));
    END LOOP;

    -- WOMEN
    p_id := 'w' || i;
    FOR j IN 0..4 LOOP
       INSERT INTO public.product_images (product_id, url, name, sort_order, is_primary)
       VALUES (p_id, w_p[((i + j - 1) % 10) + 1] || '?w=1000&auto=format&q=80', v_names[j+1], j, (j = 0));
    END LOOP;

    -- SHOES
    p_id := 's' || i;
    FOR j IN 0..4 LOOP
       INSERT INTO public.product_images (product_id, url, name, sort_order, is_primary)
       VALUES (p_id, s_p[((i + j - 1) % 10) + 1] || '?w=1000&auto=format&q=80', v_names[j+1], j, (j = 0));
    END LOOP;
  END LOOP;
END $$;


-- ============================================================
-- SECTION 8: ADMIN SETUP — Set your email as admin
-- ============================================================
-- After you first log in, run this to make your account admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';


-- ============================================================
-- VERIFICATION CHECK
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM products)        AS total_products,
  (SELECT COUNT(*) FROM product_images)  AS total_images,
  (SELECT COUNT(*) FROM categories)      AS total_categories,
  (SELECT COUNT(*) FROM products WHERE category_id = 'cat_men')   AS men_products,
  (SELECT COUNT(*) FROM products WHERE category_id = 'cat_women') AS women_products,
  (SELECT COUNT(*) FROM products WHERE category_id = 'cat_shoes') AS shoes_products;


-- ============================================================
-- SECTION 9: ADDITIONAL MARKETING & INVENTORY TABLES (v3.1)
-- ============================================================

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL NOT NULL,
    min_purchase DECIMAL DEFAULT 0,
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Security Policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_coupons" ON coupons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_variants" ON product_variants FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "public_read_coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);
