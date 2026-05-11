-- ============================================================
-- HopeCMS Phase 2 Security Patch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles Mutation Guard
-- Ensure ADMINs can only update record_status where user_type != 'SUPERADMIN'
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
-- Ensure ADMINs cannot alter rights of a SUPERADMIN
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
