-- ============================================================
-- HopeCMS Phase 2 Final Security & Seed Patch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0. Create Auth & Rights Schema (if not exists)
CREATE TABLE IF NOT EXISTS modules (
  id          SERIAL      PRIMARY KEY,
  module_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS rights (
  id          SERIAL      PRIMARY KEY,
  right_name  VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  module_id   INTEGER     REFERENCES modules(id)
);

CREATE TABLE IF NOT EXISTS user_module_rights (
  id       SERIAL  PRIMARY KEY,
  user_id  UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  right_id INTEGER NOT NULL REFERENCES rights(id),
  UNIQUE (user_id, right_id)
);

-- Seed Modules
INSERT INTO modules (id, module_name) VALUES
(1, 'Customers'),
(2, 'Sales'),
(3, 'Products'),
(4, 'Admin')
ON CONFLICT (id) DO NOTHING;

-- Seed Rights
INSERT INTO rights (id, right_name, description, module_id) VALUES
(1,  'VIEW_CUSTOMERS',    'View the customer list and details',        1),
(2,  'ADD_CUSTOMER',      'Add new customers',                         1),
(3,  'EDIT_CUSTOMER',     'Edit existing customer data',               1),
(4,  'DELETE_CUSTOMER',   'Soft-delete a customer (SUPERADMIN only)',  1),
(5,  'VIEW_SALES',        'View sales transactions',                   2),
(6,  'VIEW_PRODUCTS',     'View product catalogue',                    3),
(7,  'MANAGE_USERS',      'Activate/deactivate user accounts',         4),
(8,  'VIEW_REPORTS',      'Access reporting dashboards',               4),
(9,  'RECOVER_CUSTOMER',  'Recover soft-deleted customers',            4),
(10, 'ADM_USER',          'Access Admin portal',                       4)
ON CONFLICT (id) DO NOTHING;


-- 1. Profiles Mutation Guard
DROP POLICY IF EXISTS "Admin can update non-superadmin profiles" ON public.profiles;
CREATE POLICY "Admin can update non-superadmin profiles"
ON public.profiles FOR UPDATE
USING (
  (SELECT user_type FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPERADMIN')
)
WITH CHECK (
  (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN'
  OR 
  (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'ADMIN' 
    AND user_type != 'SUPERADMIN'
  )
);

-- 2. Rights Table Guard
DROP POLICY IF EXISTS "Admin cannot alter superadmin rights" ON public.user_module_rights;
CREATE POLICY "Admin cannot alter superadmin rights"
ON public.user_module_rights FOR ALL
USING (
  (SELECT user_type FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPERADMIN')
)
WITH CHECK (
  (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN'
  OR
  (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'ADMIN'
    AND (SELECT user_type FROM profiles WHERE id = user_id) != 'SUPERADMIN'
  )
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_rights ENABLE ROW LEVEL SECURITY;

-- 3. Seed SUPERADMIN (jcesperanza@neu.edu.ph)
-- Once you register manually on the frontend with jcesperanza@neu.edu.ph,
-- Run this follow-up query to elevate the account:

-- UPDATE public.profiles SET user_type = 'SUPERADMIN', record_status = 'ACTIVE' WHERE email = 'jcesperanza@neu.edu.ph';

-- INSERT INTO user_module_rights (user_id, right_id)
-- SELECT p.id, r.id FROM profiles p, rights r WHERE p.email = 'jcesperanza@neu.edu.ph' ON CONFLICT DO NOTHING;
