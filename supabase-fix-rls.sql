-- ============================================================
-- 1. CLEAN UP ORPHANED USERS
-- ============================================================
-- Delete any profiles in public.users that do not have a matching account in auth.users
DELETE FROM public.users WHERE id NOT IN (SELECT id FROM auth.users);


-- ============================================================
-- 2. RECREATE TRIGGER WITH AUTO-CONFLICT RESOLUTION
-- ============================================================
-- Recreate the trigger function to automatically resolve email and ID conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Delete any orphaned profile with the same email to avoid unique key conflicts
  DELETE FROM public.users WHERE email = new.email;
  
  -- Insert or update the user profile
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 3. RECREATE RLS POLICIES FOR ORDERS & ORDER ITEMS
-- ============================================================
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "orders_self_insert" ON orders;
DROP POLICY IF EXISTS "orders_self_read" ON orders;
DROP POLICY IF EXISTS "order_items_self_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_self_read" ON order_items;
DROP POLICY IF EXISTS "admin_orders_all" ON orders;
DROP POLICY IF EXISTS "admin_order_items_all" ON order_items;

-- Orders policies
-- Allow anyone to place an order (essential for guest checkouts and registered users)
CREATE POLICY "orders_insert_policy" ON orders 
FOR INSERT WITH CHECK (true);

-- Allow users to read their own orders, and allow admins to see all orders
CREATE POLICY "orders_select_policy" ON orders 
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);

-- Order Items policies
-- Allow anyone to insert order items
CREATE POLICY "order_items_insert_policy" ON order_items 
FOR INSERT WITH CHECK (true);

-- Allow users to select their own order items, and allow admins to see all order items
CREATE POLICY "order_items_select_policy" ON order_items 
FOR SELECT USING (
  (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())) OR 
  (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);


-- ============================================================
-- 4. FIX RLS POLICIES FOR CATEGORIES, PRODUCTS, IMAGES
-- ============================================================
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "admin_categories_all" ON categories;
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "Allow public read access for categories" ON categories;
DROP POLICY IF EXISTS "Allow admin read access for all categories" ON categories;
DROP POLICY IF EXISTS "Admin_C" ON categories;

DROP POLICY IF EXISTS "admin_products_all" ON products;
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "Allow public read access for products" ON products;
DROP POLICY IF EXISTS "Allow admin read access for all products" ON products;
DROP POLICY IF EXISTS "Admin_P" ON products;
DROP POLICY IF EXISTS "P_Read" ON products;

DROP POLICY IF EXISTS "admin_product_images_all" ON product_images;
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
DROP POLICY IF EXISTS "Allow public read access for images" ON product_images;
DROP POLICY IF EXISTS "Allow admin read access for all images" ON product_images;
DROP POLICY IF EXISTS "Admin_I" ON product_images;
DROP POLICY IF EXISTS "I_Read" ON product_images;

-- Recreate permissive policies for development and easy management
CREATE POLICY "categories_permissive_policy" ON categories 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "products_permissive_policy" ON products 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "product_images_permissive_policy" ON product_images 
FOR ALL USING (true) WITH CHECK (true);

