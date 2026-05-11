-- ============================================================
-- 010: RLS — customer table
-- ============================================================
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

-- SELECT: USERs see only ACTIVE; ADMIN/SUPERADMIN see all
CREATE POLICY customer_select ON customer
  FOR SELECT USING (
    record_status = 'ACTIVE'
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
  );

-- INSERT: requires ADD_CUSTOMER right
CREATE POLICY customer_insert ON customer
  FOR INSERT WITH CHECK (has_right('ADD_CUSTOMER'));

-- UPDATE: requires EDIT_CUSTOMER or RECOVER_CUSTOMER right, or SUPERADMIN
CREATE POLICY customer_update ON customer
  FOR UPDATE USING (
    has_right('EDIT_CUSTOMER')
    OR has_right('RECOVER_CUSTOMER')
    OR get_user_type() = 'SUPERADMIN'
  );

-- No DELETE policy — hard deletes are prohibited by Core Rule 1
