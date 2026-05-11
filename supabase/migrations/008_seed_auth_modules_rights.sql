-- ============================================================
-- 008: Seed Auth — Modules, Rights, and SUPERADMIN
-- ============================================================

-- 4 Modules
INSERT INTO modules (id, module_name) VALUES
(1, 'Customers'),
(2, 'Sales'),
(3, 'Products'),
(4, 'Admin')
ON CONFLICT (id) DO NOTHING;

-- 9 Rights
INSERT INTO rights (id, right_name, description, module_id) VALUES
(1,  'VIEW_CUSTOMERS',    'View the customer list and details',        1),
(2,  'ADD_CUSTOMER',      'Add new customers',                         1),
(3,  'EDIT_CUSTOMER',     'Edit existing customer data',               1),
(4,  'DELETE_CUSTOMER',   'Soft-delete a customer (SUPERADMIN only)',  1),
(5,  'VIEW_SALES',        'View sales transactions',                   2),
(6,  'VIEW_PRODUCTS',     'View product catalogue',                    3),
(7,  'MANAGE_USERS',      'Activate/deactivate user accounts',         4),
(8,  'VIEW_REPORTS',      'Access reporting dashboards',               4),
(9,  'RECOVER_CUSTOMER',  'Recover soft-deleted customers',            4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SUPERADMIN provision
-- NOTE: Run this AFTER creating the jcesperanza@neu.edu.ph
--       account via Supabase Auth Dashboard or Auth API.
--       Then run the UPDATE below to elevate their profile.
-- ============================================================

-- Step 1: Update their profile (once they sign up)
-- UPDATE profiles
--   SET user_type = 'SUPERADMIN', record_status = 'ACTIVE'
-- WHERE email = 'jcesperanza@neu.edu.ph';

-- Step 2: Grant all 9 rights
-- INSERT INTO user_module_rights (user_id, right_id)
-- SELECT p.id, r.id
-- FROM profiles p, rights r
-- WHERE p.email = 'jcesperanza@neu.edu.ph'
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- Convenience: single-run SUPERADMIN activation script
-- Replace <SUPERADMIN_UUID> with the actual auth.users UUID
-- ============================================================
-- DO $$
-- DECLARE sa_id UUID := '<SUPERADMIN_UUID>';
-- BEGIN
--   UPDATE profiles SET user_type='SUPERADMIN', record_status='ACTIVE' WHERE id = sa_id;
--   INSERT INTO user_module_rights (user_id, right_id)
--   SELECT sa_id, r.id FROM rights r ON CONFLICT DO NOTHING;
-- END $$;
