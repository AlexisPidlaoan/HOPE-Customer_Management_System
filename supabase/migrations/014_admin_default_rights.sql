-- ============================================================
-- 014: Document & enforce ADMIN default rights
-- ============================================================
-- Per Rights Matrix (Section 3.2):
--   ADMIN (Sales Mgr) gets:
--     CUST_VIEW   (1) VIEW_CUSTOMERS     YES
--     CUST_ADD    (2) ADD_CUSTOMER       YES
--     CUST_EDIT   (3) EDIT_CUSTOMER      YES
--     CUST_DEL    (4) DELETE_CUSTOMER    NO  ← NOT granted
--     VIEW_SALES  (5) VIEW_SALES         YES (VIEW ONLY)
--     SD_VIEW     (5) VIEW_SALES         YES (VIEW ONLY, reuses same right)
--     VIEW_PRODS  (6) VIEW_PRODUCTS      YES (VIEW ONLY)
--     MANAGE_USRS (7) MANAGE_USERS       YES (Admin panel access)
--     VIEW_RPTS   (8) VIEW_REPORTS       YES (Reports submenu access)
--     RECOVER     (9) RECOVER_CUSTOMER   NO  ← SUPERADMIN only
--
--   USER (Sales Staff) gets:
--     CUST_VIEW   (1) VIEW_CUSTOMERS     YES
--     CUST_ADD    (2) ADD_CUSTOMER       NO
--     CUST_EDIT   (3) EDIT_CUSTOMER      NO
--     VIEW_SALES  (5) VIEW_SALES         YES (VIEW ONLY)
--     VIEW_PRODS  (6) VIEW_PRODUCTS      YES (VIEW ONLY)
--     (rights 2,3,4,7,8,9 NOT granted)
--
-- The trigger (009) already grants rights 1,5,6 to all new users.
-- Run the block below to grant ADMIN-level rights to a specific user.
-- Replace <ADMIN_UUID> with the actual auth.users UUID.
-- ============================================================

-- Grant ADMIN rights (run after promoting user to ADMIN type)
-- DO $$
-- DECLARE admin_id UUID := '<ADMIN_UUID>';
-- BEGIN
--   -- Ensure USER base rights exist
--   INSERT INTO user_module_rights (user_id, right_id)
--   VALUES
--     (admin_id, 1),  -- VIEW_CUSTOMERS
--     (admin_id, 2),  -- ADD_CUSTOMER
--     (admin_id, 3),  -- EDIT_CUSTOMER
--     -- right 4 (DELETE_CUSTOMER) intentionally omitted for ADMIN
--     (admin_id, 5),  -- VIEW_SALES
--     (admin_id, 6),  -- VIEW_PRODUCTS
--     (admin_id, 7),  -- MANAGE_USERS
--     (admin_id, 8)   -- VIEW_REPORTS
--     -- right 9 (RECOVER_CUSTOMER) intentionally omitted for ADMIN
--   ON CONFLICT (user_id, right_id) DO NOTHING;
-- END $$;

-- ============================================================
-- Convenience function: promote_to_admin(user_email TEXT)
-- Grants ADMIN rights matrix to a user identified by email.
-- Safe to run multiple times (ON CONFLICT DO NOTHING).
-- ============================================================
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM profiles WHERE email = user_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No profile found for email: %', user_email;
  END IF;

  -- Update profile type
  UPDATE profiles SET user_type = 'ADMIN', record_status = 'ACTIVE'
  WHERE id = target_id;

  -- Grant ADMIN rights per matrix (no DELETE_CUSTOMER, no RECOVER_CUSTOMER)
  INSERT INTO user_module_rights (user_id, right_id)
  VALUES
    (target_id, 1),  -- VIEW_CUSTOMERS
    (target_id, 2),  -- ADD_CUSTOMER
    (target_id, 3),  -- EDIT_CUSTOMER
    (target_id, 5),  -- VIEW_SALES
    (target_id, 6),  -- VIEW_PRODUCTS
    (target_id, 7),  -- MANAGE_USERS
    (target_id, 8)   -- VIEW_REPORTS
  ON CONFLICT (user_id, right_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Convenience function: promote_to_user(user_email TEXT)
-- Activates a USER with base view rights per matrix.
-- ============================================================
CREATE OR REPLACE FUNCTION promote_to_user(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM profiles WHERE email = user_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No profile found for email: %', user_email;
  END IF;

  -- Update profile type and activate
  UPDATE profiles SET user_type = 'USER', record_status = 'ACTIVE'
  WHERE id = target_id;

  -- Grant USER rights per matrix (VIEW only)
  INSERT INTO user_module_rights (user_id, right_id)
  VALUES
    (target_id, 1),  -- VIEW_CUSTOMERS
    (target_id, 5),  -- VIEW_SALES
    (target_id, 6)   -- VIEW_PRODUCTS
  ON CONFLICT (user_id, right_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
