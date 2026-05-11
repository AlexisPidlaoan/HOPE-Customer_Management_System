-- Run this in Supabase SQL Editor to fix the missing SELECT policies!

-- 1. Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Allow Admins to read all profiles (needed for User Management)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  (SELECT user_type FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPERADMIN')
);

-- 3. Allow users to read their own rights
DROP POLICY IF EXISTS "Users can view own rights" ON public.user_module_rights;
CREATE POLICY "Users can view own rights" 
ON public.user_module_rights FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Allow Admins to read all rights
DROP POLICY IF EXISTS "Admins can view all rights" ON public.user_module_rights;
CREATE POLICY "Admins can view all rights" 
ON public.user_module_rights FOR SELECT 
USING (
  (SELECT user_type FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPERADMIN')
);
