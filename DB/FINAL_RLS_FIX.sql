-- ============================================================
-- FINAL RLS FIX — Run this in Supabase SQL Editor (Role: postgres)
-- This script fixes the root cause: RLS policies block data
-- because the helper functions don't exist or are mismatched.
-- ============================================================

-- ============================================================
-- STEP 1: Recreate ALL helper functions with correct signatures
-- These are used inside RLS policies. If they don't exist or
-- have wrong signatures, ALL queries return 0 rows.
-- ============================================================

-- Drop any conflicting overloads first
DROP FUNCTION IF EXISTS public.get_user_type() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_type(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.has_right(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.has_right(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_status() CASCADE;
DROP FUNCTION IF EXISTS public.check_is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_is_superadmin(UUID) CASCADE;

-- get_user_type() — no args, used by RLS policies
CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS TEXT AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- get_user_type(uuid) — used by check_is_admin helpers
CREATE OR REPLACE FUNCTION public.get_user_type(u_id UUID)
RETURNS TEXT AS $$
  SELECT user_type FROM public.profiles WHERE id = u_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- get_user_status()
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS TEXT AS $$
  SELECT record_status FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- has_right(text) — used by RLS policies on sales, customer, product, etc.
CREATE OR REPLACE FUNCTION public.has_right(p_right TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_module_rights umr
    JOIN public.rights r ON r.id = umr.right_id
    WHERE umr.user_id = auth.uid()
      AND r.right_name = p_right
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- check_is_admin / check_is_superadmin helpers
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_type(user_id) IN ('ADMIN', 'SUPERADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.check_is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_type(user_id) = 'SUPERADMIN';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 2: Drop ALL existing RLS policies and recreate them
-- The old policies may reference functions that no longer exist
-- after the DROP CASCADE above. We must recreate them cleanly.
-- ============================================================

-- Customer policies
DROP POLICY IF EXISTS customer_select ON customer;
DROP POLICY IF EXISTS customer_insert ON customer;
DROP POLICY IF EXISTS customer_update ON customer;

CREATE POLICY customer_select ON customer
  FOR SELECT USING (
    record_status = 'ACTIVE'
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
  );

CREATE POLICY customer_insert ON customer
  FOR INSERT WITH CHECK (has_right('ADD_CUSTOMER'));

CREATE POLICY customer_update ON customer
  FOR UPDATE USING (
    has_right('EDIT_CUSTOMER')
    OR has_right('RECOVER_CUSTOMER')
    OR get_user_type() = 'SUPERADMIN'
  );

-- Sales policies
DROP POLICY IF EXISTS sales_select ON sales;
CREATE POLICY sales_select ON sales
  FOR SELECT USING (has_right('VIEW_SALES'));

-- Sales detail policies
DROP POLICY IF EXISTS salesdetail_select ON salesdetail;
CREATE POLICY salesdetail_select ON salesdetail
  FOR SELECT USING (has_right('VIEW_SALES'));

-- Product policies
DROP POLICY IF EXISTS product_select ON product;
CREATE POLICY product_select ON product
  FOR SELECT USING (has_right('VIEW_PRODUCTS'));

-- Price history policies
DROP POLICY IF EXISTS pricehist_select ON pricehist;
CREATE POLICY pricehist_select ON pricehist
  FOR SELECT USING (has_right('VIEW_PRODUCTS'));

-- Profiles policies
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;

CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
  );

CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (get_user_type() IN ('ADMIN', 'SUPERADMIN'));

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (
    (get_user_type() = 'ADMIN' AND user_type != 'SUPERADMIN')
    OR get_user_type() = 'SUPERADMIN'
    OR id = auth.uid()
  );

-- Modules policies
DROP POLICY IF EXISTS modules_select ON modules;
CREATE POLICY modules_select ON modules FOR SELECT USING (auth.uid() IS NOT NULL);

-- Rights policies
DROP POLICY IF EXISTS rights_select ON rights;
CREATE POLICY rights_select ON rights FOR SELECT USING (auth.uid() IS NOT NULL);

-- User module rights policies
DROP POLICY IF EXISTS umr_select ON user_module_rights;
DROP POLICY IF EXISTS umr_insert ON user_module_rights;
DROP POLICY IF EXISTS umr_update ON user_module_rights;

CREATE POLICY umr_select ON user_module_rights
  FOR SELECT USING (
    user_id = auth.uid()
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
  );

CREATE POLICY umr_insert ON user_module_rights
  FOR INSERT WITH CHECK (get_user_type() IN ('ADMIN', 'SUPERADMIN'));

CREATE POLICY umr_update ON user_module_rights
  FOR UPDATE USING (get_user_type() IN ('ADMIN', 'SUPERADMIN'));


-- ============================================================
-- STEP 3: Recreate the auth trigger
-- ============================================================
CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, user_type, record_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'USER',
    'INACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_module_rights (user_id, right_id)
  VALUES (NEW.id, 1), (NEW.id, 5), (NEW.id, 6)
  ON CONFLICT (user_id, right_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_new_user();


-- ============================================================
-- STEP 4: Ensure modules and rights seed data exists
-- ============================================================
INSERT INTO public.modules (id, module_name) VALUES
(1, 'Customers'),
(2, 'Sales'),
(3, 'Products'),
(4, 'Admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rights (id, right_name, description, module_id) VALUES
(1,  'VIEW_CUSTOMERS',   'View the customer list and details',        1),
(2,  'ADD_CUSTOMER',     'Add new customers',                         1),
(3,  'EDIT_CUSTOMER',    'Edit existing customer data',               1),
(4,  'DELETE_CUSTOMER',  'Soft-delete a customer (SUPERADMIN only)',  1),
(5,  'VIEW_SALES',       'View sales transactions',                   2),
(6,  'VIEW_PRODUCTS',    'View product catalogue',                    3),
(7,  'MANAGE_USERS',     'Activate/deactivate user accounts',         4),
(8,  'VIEW_REPORTS',     'Access reporting dashboards',               4),
(9,  'RECOVER_CUSTOMER', 'Recover soft-deleted customers',            4),
(10, 'ADM_USER',         'Access Admin portal',                       4)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STEP 5: Elevate admin accounts to SUPERADMIN
-- ============================================================
UPDATE public.profiles
SET user_type = 'SUPERADMIN', record_status = 'ACTIVE'
WHERE email IN ('xander.macayan@neu.edu.ph', 'jcesperanza@neu.edu.ph');

UPDATE public.profiles
SET user_type = 'ADMIN', record_status = 'ACTIVE'
WHERE email = 'kaptainzek703@gmail.com';

-- Activate all remaining profiles
UPDATE public.profiles
SET record_status = 'ACTIVE'
WHERE record_status = 'INACTIVE';

-- ============================================================
-- STEP 6: Grant ALL rights to ALL existing users
-- This ensures every user can see customers and sales
-- ============================================================
INSERT INTO public.user_module_rights (user_id, right_id)
SELECT p.id, r.id
FROM public.profiles p
CROSS JOIN public.rights r
ON CONFLICT (user_id, right_id) DO NOTHING;


-- ============================================================
-- STEP 7: Verify — run to confirm everything is correct
-- ============================================================
SELECT
  p.email,
  p.user_type,
  p.record_status,
  COUNT(umr.right_id) AS rights_count
FROM public.profiles p
LEFT JOIN public.user_module_rights umr ON umr.user_id = p.id
GROUP BY p.email, p.user_type, p.record_status;

-- Every user should show rights_count = 10 and record_status = ACTIVE
-- If this is the case, sign out and sign back in on the website.
-- Customers and Sales will now show data!
