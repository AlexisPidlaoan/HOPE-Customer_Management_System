-- ============================================================
-- 009: Auth Trigger — provision_new_user()
-- ============================================================

-- Helper: get current user's type
CREATE OR REPLACE FUNCTION get_user_type()
RETURNS TEXT AS $$
  SELECT user_type FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's status
CREATE OR REPLACE FUNCTION get_user_status()
RETURNS TEXT AS $$
  SELECT record_status FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user has a specific right
CREATE OR REPLACE FUNCTION has_right(right_name_param TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_module_rights umr
    JOIN rights r ON r.id = umr.right_id
    WHERE umr.user_id = auth.uid()
    AND r.right_name = right_name_param
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger function: auto-provisions new users as USER/INACTIVE
-- and grants default VIEW rights (rights 1, 5, 6)
CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO profiles (id, email, full_name, user_type, record_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'USER',
    'INACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Grant default VIEW rights: VIEW_CUSTOMERS(1), VIEW_SALES(5), VIEW_PRODUCTS(6)
  INSERT INTO user_module_rights (user_id, right_id)
  VALUES (NEW.id, 1), (NEW.id, 5), (NEW.id, 6)
  ON CONFLICT (user_id, right_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_new_user();
