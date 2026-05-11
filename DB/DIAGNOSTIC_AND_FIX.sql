-- ============================================================
-- HopeCMS DIAGNOSTIC & FIX
-- Run all sections in Supabase SQL Editor (in order)
-- ============================================================

-- ============================================================
-- SECTION 1: Re-create helper functions with correct signatures
-- (fixes any get_user_type / has_right mismatch)
-- ============================================================

-- get_user_type() with NO args — used by RLS policies in migrations
CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS VARCHAR AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- get_user_type(uuid) with arg — used by Fix_Recursion.sql helpers
CREATE OR REPLACE FUNCTION public.get_user_type(u_id UUID)
RETURNS VARCHAR AS $$
  SELECT user_type FROM public.profiles WHERE id = u_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- has_right(right_name) — used by RLS policies on sales, customer, etc.
CREATE OR REPLACE FUNCTION public.has_right(p_right VARCHAR)
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
-- SECTION 2: Make sure seed data exists (modules & rights)
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
-- SECTION 3: Activate admin accounts & grant all rights
-- ============================================================

-- Elevate to SUPERADMIN
UPDATE public.profiles
SET user_type = 'SUPERADMIN', record_status = 'ACTIVE'
WHERE email IN ('xander.macayan@neu.edu.ph', 'jcesperanza@neu.edu.ph');

-- Elevate to ADMIN
UPDATE public.profiles
SET user_type = 'ADMIN', record_status = 'ACTIVE'
WHERE email = 'kaptainzek703@gmail.com';

-- Grant ALL rights to all 3 accounts
INSERT INTO public.user_module_rights (user_id, right_id)
SELECT p.id, r.id
FROM public.profiles p
CROSS JOIN public.rights r
WHERE p.email IN ('xander.macayan@neu.edu.ph', 'kaptainzek703@gmail.com', 'jcesperanza@neu.edu.ph')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: Verify — run this to confirm everything is set
-- ============================================================

SELECT
  p.email,
  p.user_type,
  p.record_status,
  COUNT(umr.right_id) AS rights_count
FROM public.profiles p
LEFT JOIN public.user_module_rights umr ON umr.user_id = p.id
WHERE p.email IN ('xander.macayan@neu.edu.ph', 'kaptainzek703@gmail.com', 'jcesperanza@neu.edu.ph')
GROUP BY p.email, p.user_type, p.record_status;

-- Expected output: each account should show rights_count = 10
-- If rights_count = 0, data will NOT show on Customer/Sales pages
