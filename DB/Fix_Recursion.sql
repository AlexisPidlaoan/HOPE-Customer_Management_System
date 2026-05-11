-- ============================================================
-- FIX RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create a helper function to get user role without triggering RLS
-- SECURITY DEFINER allows the function to bypass RLS policies
CREATE OR REPLACE FUNCTION public.get_user_type(u_id UUID)
RETURNS VARCHAR AS $$
  SELECT user_type FROM public.profiles WHERE id = u_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (public.get_user_type(user_id) IN ('ADMIN', 'SUPERADMIN'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (public.get_user_type(user_id) = 'SUPERADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive and existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update non-superadmin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin cannot alter superadmin rights" ON public.user_module_rights;
DROP POLICY IF EXISTS "Admins can view all rights" ON public.user_module_rights;
DROP POLICY IF EXISTS "Users can view own rights" ON public.user_module_rights;

-- 3. Re-create the policies using the helper functions
-- Profile Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.check_is_admin(auth.uid()));

CREATE POLICY "Admin can update non-superadmin profiles"
ON public.profiles FOR UPDATE
USING (public.check_is_admin(auth.uid()))
WITH CHECK (
  public.check_is_superadmin(auth.uid())
  OR 
  (public.check_is_admin(auth.uid()) AND user_type != 'SUPERADMIN')
);

-- Rights Policies
CREATE POLICY "Users can view own rights" 
ON public.user_module_rights FOR SELECT 
USING (auth.uid() = user_id OR public.check_is_admin(auth.uid()));

CREATE POLICY "Admin cannot alter superadmin rights"
ON public.user_module_rights FOR ALL
USING (public.check_is_admin(auth.uid()))
WITH CHECK (
  public.check_is_superadmin(auth.uid())
  OR
  (public.check_is_admin(auth.uid()) AND public.get_user_type(user_id) != 'SUPERADMIN')
);
