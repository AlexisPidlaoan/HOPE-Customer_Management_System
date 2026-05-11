-- ============================================================
-- SETUP ADMIN AND SUPERADMIN ACCOUNTS
-- Target Emails: 
--   Superadmin: xander.macayan@neu.edu.ph
--   Admin:      kaptainzek703@gmail.com
-- ============================================================

-- 1. Update the Trigger Function to automatically promote these emails on first sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, record_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN new.email = 'xander.macayan@neu.edu.ph' THEN 'SUPERADMIN'
      WHEN new.email = 'kaptainzek703@gmail.com' THEN 'ADMIN'
      ELSE 'USER'
    END,
    CASE 
      WHEN new.email IN ('xander.macayan@neu.edu.ph', 'kaptainzek703@gmail.com') THEN 'ACTIVE'
      ELSE 'INACTIVE'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing profiles if they have already signed in
UPDATE public.profiles
SET 
  user_type = 'SUPERADMIN',
  record_status = 'ACTIVE'
WHERE email = 'xander.macayan@neu.edu.ph';

UPDATE public.profiles
SET 
  user_type = 'ADMIN',
  record_status = 'ACTIVE'
WHERE email = 'kaptainzek703@gmail.com';

-- 3. Grant all module rights to these accounts
INSERT INTO public.user_module_rights (user_id, right_id)
SELECT p.id, r.id 
FROM public.profiles p, public.rights r 
WHERE p.email IN ('xander.macayan@neu.edu.ph', 'kaptainzek703@gmail.com')
ON CONFLICT DO NOTHING;

-- 4. Update the Trigger Function to also grant rights automatically for these emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_user_type VARCHAR(15);
    new_record_status VARCHAR(10);
BEGIN
    -- Determine role
    IF new.email = 'xander.macayan@neu.edu.ph' THEN
        new_user_type := 'SUPERADMIN';
        new_record_status := 'ACTIVE';
    ELSIF new.email = 'kaptainzek703@gmail.com' THEN
        new_user_type := 'ADMIN';
        new_record_status := 'ACTIVE';
    ELSE
        new_user_type := 'USER';
        new_record_status := 'INACTIVE';
    END IF;

    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, user_type, record_status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        new_user_type,
        new_record_status
    );

    -- If Admin or Superadmin, grant all rights automatically
    IF new_user_type IN ('ADMIN', 'SUPERADMIN') THEN
        INSERT INTO public.user_module_rights (user_id, right_id)
        SELECT new.id, r.id FROM public.rights r
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
