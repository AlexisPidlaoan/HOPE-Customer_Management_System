-- ============================================================
-- MANUAL ADMIN ACTIVATION SCRIPT
-- Run this in your Supabase SQL Editor to activate your accounts.
-- ============================================================

-- 1. Elevate Superadmins
UPDATE public.profiles
SET 
  user_type = 'SUPERADMIN',
  record_status = 'ACTIVE'
WHERE email IN ('xander.macayan@neu.edu.ph', 'jcesperanza@neu.edu.ph');

-- 2. Elevate Admin
UPDATE public.profiles
SET 
  user_type = 'ADMIN',
  record_status = 'ACTIVE'
WHERE email = 'kaptainzek703@gmail.com';

-- 3. Grant ALL current module rights to these accounts
INSERT INTO public.user_module_rights (user_id, right_id)
SELECT p.id, r.id 
FROM public.profiles p, public.rights r 
WHERE p.email IN ('xander.macayan@neu.edu.ph', 'kaptainzek703@gmail.com', 'jcesperanza@neu.edu.ph')
ON CONFLICT DO NOTHING;

-- 4. Verification Query
SELECT email, user_type, record_status 
FROM public.profiles 
WHERE email IN ('xander.macayan@neu.edu.ph', 'kaptainzek703@gmail.com', 'jcesperanza@neu.edu.ph');
