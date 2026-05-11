-- ============================================================
-- 012: RLS — profiles, modules, rights, user_module_rights
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile; ADMIN/SUPERADMIN see all
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
  );

-- Only ADMIN/SUPERADMIN can INSERT profiles (manual provision)
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (get_user_type() IN ('ADMIN', 'SUPERADMIN'));

-- UPDATE: ADMIN/SUPERADMIN can update; Core Rule 4: ADMIN cannot update SUPERADMIN rows
CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (
    (get_user_type() = 'ADMIN' AND user_type != 'SUPERADMIN')
    OR get_user_type() = 'SUPERADMIN'
    OR id = auth.uid()
  );

-- modules (read-only for all authenticated users)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY modules_select ON modules FOR SELECT USING (auth.uid() IS NOT NULL);

-- rights (read-only for all authenticated users)
ALTER TABLE rights ENABLE ROW LEVEL SECURITY;
CREATE POLICY rights_select ON rights FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_module_rights
ALTER TABLE user_module_rights ENABLE ROW LEVEL SECURITY;

CREATE POLICY umr_select ON user_module_rights
  FOR SELECT USING (
    user_id = auth.uid()
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
  );

CREATE POLICY umr_insert ON user_module_rights
  FOR INSERT WITH CHECK (get_user_type() IN ('ADMIN', 'SUPERADMIN'));

CREATE POLICY umr_update ON user_module_rights
  FOR UPDATE USING (get_user_type() IN ('ADMIN', 'SUPERADMIN'));
