-- ============================================================
-- COMPREHENSIVE AUTH FIX — Run this in Supabase SQL Editor
-- Role: postgres
--
-- Fixes TWO issues:
--   1. "Database error saving new user" on registration
--   2. Google OAuth users can't log in (stuck as INACTIVE)
--
-- Root causes:
--   - Old trigger handle_new_user() has no ON CONFLICT and crashes
--   - profiles_insert RLS policy blocks the trigger from inserting
--   - Google OAuth users are created as INACTIVE and immediately signed out
-- ============================================================


-- ============================================================
-- STEP 1: Drop ALL old triggers on auth.users
-- There may be multiple conflicting triggers from past migrations
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_new_user ON auth.users;

-- Drop ALL old trigger functions to avoid confusion
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.provision_new_user() CASCADE;


-- ============================================================
-- STEP 2: Create the ONE correct trigger function
-- - Google OAuth users → USER / ACTIVE (can log in immediately)
-- - Email/password users → USER / INACTIVE (need admin activation)
-- - Known admin emails → ADMIN or SUPERADMIN / ACTIVE
-- - ON CONFLICT prevents crashes on duplicate registrations
-- ============================================================
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _provider TEXT;
  _user_type TEXT;
  _status TEXT;
BEGIN
  -- Detect the auth provider
  _provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  -- Determine user type based on email
  IF NEW.email = 'xander.macayan@neu.edu.ph' OR NEW.email = 'jcesperanza@neu.edu.ph' THEN
    _user_type := 'SUPERADMIN';
    _status := 'ACTIVE';
  ELSIF NEW.email = 'kaptainzek703@gmail.com' THEN
    _user_type := 'ADMIN';
    _status := 'ACTIVE';
  ELSIF _provider = 'google' THEN
    -- Google OAuth users are auto-activated as regular USERs
    _user_type := 'USER';
    _status := 'ACTIVE';
  ELSE
    -- Email/password registration requires admin activation
    _user_type := 'USER';
    _status := 'INACTIVE';
  END IF;

  -- Insert profile (ON CONFLICT prevents crashes if profile already exists)
  INSERT INTO public.profiles (id, email, full_name, user_type, record_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    _user_type,
    _status
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        record_status = CASE
          -- If user was INACTIVE and is now signing in via Google, activate them
          WHEN profiles.record_status = 'INACTIVE' AND _provider = 'google' THEN 'ACTIVE'
          ELSE profiles.record_status
        END;

  -- Grant default VIEW rights for ALL new users
  INSERT INTO public.user_module_rights (user_id, right_id)
  VALUES (NEW.id, 1), (NEW.id, 5), (NEW.id, 6)
  ON CONFLICT (user_id, right_id) DO NOTHING;

  -- If admin/superadmin, grant ALL rights
  IF _user_type IN ('ADMIN', 'SUPERADMIN') THEN
    INSERT INTO public.user_module_rights (user_id, right_id)
    SELECT NEW.id, r.id FROM public.rights r
    ON CONFLICT (user_id, right_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 3: Attach the trigger
-- ============================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();


-- ============================================================
-- STEP 4: Fix the profiles_insert RLS policy
-- The old policy ONLY allows ADMIN/SUPERADMIN to insert profiles.
-- This blocks the trigger from creating profiles for new users!
-- We need to also allow users to insert their OWN profile row.
-- ============================================================
DROP POLICY IF EXISTS profiles_insert ON profiles;

CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (
    -- Allow the trigger to insert the user's own profile
    id = auth.uid()
    -- Allow admins to create profiles for other users
    OR get_user_type() IN ('ADMIN', 'SUPERADMIN')
    -- Allow service-role / postgres inserts (for the trigger)
    OR auth.uid() IS NULL
  );


-- ============================================================
-- STEP 5: Fix any existing Google OAuth users stuck as INACTIVE
-- ============================================================
UPDATE public.profiles
SET record_status = 'ACTIVE'
WHERE record_status = 'INACTIVE'
  AND id IN (
    SELECT id FROM auth.users
    WHERE raw_app_meta_data->>'provider' = 'google'
  );


-- ============================================================
-- STEP 6: Verify everything is correct
-- ============================================================
SELECT
  p.email,
  p.user_type,
  p.record_status,
  u.raw_app_meta_data->>'provider' AS auth_provider,
  COUNT(umr.right_id) AS rights_count
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN public.user_module_rights umr ON umr.user_id = p.id
GROUP BY p.email, p.user_type, p.record_status, u.raw_app_meta_data->>'provider'
ORDER BY p.record_status, p.email;
