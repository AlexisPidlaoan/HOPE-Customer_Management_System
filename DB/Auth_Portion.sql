-- ============================================================
-- SUPABASE AUTHENTICATION INTEGRATION
-- Includes Profiles, Auth Triggers, and RLS Setup
-- Needed for Register, Login, and Google Auth
-- ============================================================

-- 1. Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT         NOT NULL,
  full_name     TEXT,
  user_type     VARCHAR(15)  NOT NULL DEFAULT 'USER'     CHECK (user_type IN ('USER','ADMIN','SUPERADMIN')),
  record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE' CHECK (record_status IN ('ACTIVE','INACTIVE')),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. Create Trigger Function for New Users (Handles Register & Google Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, record_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'USER',
    'INACTIVE' -- Admins must activate users
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable Row Level Security (RLS) on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by admins" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type IN ('ADMIN', 'SUPERADMIN')
  )
);

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- (Optional) Link employee/customer tables to auth by adding UUID columns if needed in the future
-- ALTER TABLE employee ADD COLUMN auth_id UUID REFERENCES auth.users(id);
-- ALTER TABLE customer ADD COLUMN auth_id UUID REFERENCES auth.users(id);
