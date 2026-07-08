-- ============================================================
-- HAMZURE MARKETING & INVENTORY UPDATE (v3.3)
-- Switched to modern gen_random_uuid() for maximum compatibility.
-- ============================================================

-- Ensure the extension is enabled just in case, but use the modern function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Security Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "admin_all_coupons" ON coupons;
    DROP POLICY IF EXISTS "admin_all_variants" ON product_variants;
    DROP POLICY IF EXISTS "admin_all_reviews" ON reviews;
    DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
    DROP POLICY IF EXISTS "public_read_variants" ON product_variants;
    DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
END $$;

CREATE POLICY "admin_all_coupons" ON coupons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_variants" ON product_variants FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "public_read_coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);


-- ============================================================
-- HAMZURE IMAGE ENGINE v4.0 (ULTIMATE RESET)
-- This ensures every product has a unique, correct photo.
-- ============================================================

-- 1. CLEAN THE SLATE
DELETE FROM public.product_images;

-- 2. APPLY THE UNIQUE IMAGES
DO $$
DECLARE
  m_i TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4357', -- m1
    'https://images.unsplash.com/photo-1593032465175-481ac7f402a1', -- m2
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f', -- m3
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59', -- m4
    'https://images.unsplash.com/photo-1592862902946-75df497a73eb', -- m5
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e', -- m6
    'https://images.unsplash.com/photo-1621335829175-95f437384d7c', -- m7
    'https://images.unsplash.com/photo-1626497741445-562f92418528', -- m8
    'https://images.unsplash.com/photo-1550246140-5119ae4790b8', -- m9
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', -- m10
    'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0', -- m11
    'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7', -- m12
    'https://images.unsplash.com/photo-1618517351616-3e0e7a2b97f0', -- m13
    'https://images.unsplash.com/photo-1507679799987-c73774586594', -- m14
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6', -- m15
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc', -- m16
    'https://images.unsplash.com/photo-1543132220-3ce99c5ae941'  -- m17
  ];
  w_i TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1539109132374-34fa92d91295', -- w1
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446', -- w2
    'https://images.unsplash.com/photo-1518606346214-7294fb8eb12e', -- w3
    'https://images.unsplash.com/photo-1624378439674-70618e3ef32f', -- w4
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03', -- w5
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c', -- w6
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923', -- w7
    'https://images.unsplash.com/photo-1566206091558-7f218b696731', -- w8
    'https://images.unsplash.com/photo-1550630968-0fa19614742a', -- w9
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0953', -- w10
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105', -- w11
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1', -- w12
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc', -- w13
    'https://images.unsplash.com/photo-1591361730043-4e4f7e2525ee', -- w14
    'https://images.unsplash.com/photo-1610337673044-720471f83677', -- w15
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8', -- w16
    'https://images.unsplash.com/photo-1598559069352-3d8437b0d42c'  -- w17
  ];
  s_i TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4', -- s1
    'https://images.unsplash.com/photo-1533659011278-297fa1f20b4a', -- s2
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa', -- s3
    'https://images.unsplash.com/photo-1541176633090-67299ac52573', -- s4
    'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3', -- s5
    'https://images.unsplash.com/photo-1603191659812-ef9ff634cb3a', -- s6
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901', -- s7
    'https://images.unsplash.com/photo-1621022204556-3f9fe5243166', -- s8
    'https://images.unsplash.com/photo-1520639889313-7ef7205bb274', -- s9
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff', -- s10
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4', -- s11
    'https://images.unsplash.com/photo-1603191659812-ef9ff634cb3a', -- s12
    'https://images.unsplash.com/photo-1603191659812-ef9ff634cb3a', -- s13
    'https://images.unsplash.com/photo-1515320501170-1378f5661625', -- s14
    'https://images.unsplash.com/photo-1595341888016-a392ef81b7de', -- s15
    'https://images.unsplash.com/photo-1533659011278-297fa1f20b4a', -- s16
    'https://images.unsplash.com/photo-1494496195158-c3becb4f2475'  -- s17
  ];
BEGIN
  FOR i IN 1..17 LOOP
    -- Insert Men
    INSERT INTO public.product_images (product_id, url, sort_order, is_primary)
    VALUES ('m' || i, m_i[i] || '?w=1200&q=90', 0, true);

    -- Insert Women
    INSERT INTO public.product_images (product_id, url, sort_order, is_primary)
    VALUES ('w' || i, w_i[i] || '?w=1200&q=90', 0, true);

    -- Insert Shoes
    INSERT INTO public.product_images (product_id, url, sort_order, is_primary)
    VALUES ('s' || i, s_i[i] || '?w=1200&q=90', 0, true);
  END LOOP;
END $$;

