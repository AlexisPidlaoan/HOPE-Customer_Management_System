-- ============================================================
-- AUDIT LOGS TABLE + TRIGGERS
-- Run in Supabase SQL Editor (Role: postgres)
-- ============================================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          BIGSERIAL    PRIMARY KEY,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  user_id     UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT,
  action      TEXT         NOT NULL,  -- e.g. 'USER_ACTIVATED', 'CUSTOMER_ADDED'
  target_type TEXT,                   -- e.g. 'profile', 'customer'
  target_id   TEXT,                   -- e.g. user_id or custno
  details     JSONB        DEFAULT '{}'
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only SUPERADMIN can read audit logs
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (get_user_type() = 'SUPERADMIN');

-- Allow inserts from triggers (service role / postgres)
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (true);


-- ============================================================
-- 2. Trigger: log profile changes (user_type, record_status)
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log user_type changes
  IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
    INSERT INTO public.audit_logs (user_id, user_email, action, target_type, target_id, details)
    VALUES (
      auth.uid(),
      (SELECT email FROM profiles WHERE id = auth.uid()),
      'USER_ROLE_CHANGED',
      'profile',
      NEW.id::TEXT,
      jsonb_build_object(
        'target_email', NEW.email,
        'old_role', OLD.user_type,
        'new_role', NEW.user_type
      )
    );
  END IF;

  -- Log record_status changes (activation/deactivation)
  IF OLD.record_status IS DISTINCT FROM NEW.record_status THEN
    INSERT INTO public.audit_logs (user_id, user_email, action, target_type, target_id, details)
    VALUES (
      auth.uid(),
      (SELECT email FROM profiles WHERE id = auth.uid()),
      CASE WHEN NEW.record_status = 'ACTIVE' THEN 'USER_ACTIVATED' ELSE 'USER_DEACTIVATED' END,
      'profile',
      NEW.id::TEXT,
      jsonb_build_object(
        'target_email', NEW.email,
        'old_status', OLD.record_status,
        'new_status', NEW.record_status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_profile ON profiles;
CREATE TRIGGER trg_audit_profile
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_profile_changes();


-- ============================================================
-- 3. Trigger: log customer changes (add, edit, soft-delete)
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_customer_changes()
RETURNS TRIGGER AS $$
DECLARE
  _action TEXT;
  _details JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _action := 'CUSTOMER_ADDED';
    _details := jsonb_build_object('custno', NEW.custno, 'custname', NEW.custname);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.record_status = 'ACTIVE' AND NEW.record_status = 'INACTIVE' THEN
      _action := 'CUSTOMER_DEACTIVATED';
    ELSIF OLD.record_status = 'INACTIVE' AND NEW.record_status = 'ACTIVE' THEN
      _action := 'CUSTOMER_RECOVERED';
    ELSE
      _action := 'CUSTOMER_EDITED';
    END IF;
    _details := jsonb_build_object(
      'custno', NEW.custno,
      'custname', NEW.custname,
      'changes', jsonb_build_object(
        'old_name', OLD.custname,
        'new_name', NEW.custname,
        'old_status', OLD.record_status,
        'new_status', NEW.record_status
      )
    );
  END IF;

  INSERT INTO public.audit_logs (user_id, user_email, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    (SELECT email FROM profiles WHERE id = auth.uid()),
    _action,
    'customer',
    COALESCE(NEW.custno, OLD.custno),
    _details
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_customer ON customer;
CREATE TRIGGER trg_audit_customer
  AFTER INSERT OR UPDATE ON customer
  FOR EACH ROW EXECUTE FUNCTION audit_customer_changes();


-- ============================================================
-- 4. Log new user sign-ups (extend the provision trigger)
--    We insert an audit log when a new user is provisioned
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, user_email, action, target_type, target_id, details)
  VALUES (
    NEW.id,
    NEW.email,
    'USER_SIGNED_UP',
    'profile',
    NEW.id::TEXT,
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_signup ON auth.users;
CREATE TRIGGER trg_audit_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION audit_new_user();


-- ============================================================
-- 5. Seed some initial audit log entries from existing data
-- ============================================================
INSERT INTO public.audit_logs (created_at, user_email, action, target_type, target_id, details)
SELECT
  p.created_at,
  p.email,
  'USER_SIGNED_UP',
  'profile',
  p.id::TEXT,
  jsonb_build_object('email', p.email, 'provider', COALESCE(u.raw_app_meta_data->>'provider', 'email'))
FROM profiles p
JOIN auth.users u ON u.id = p.id
ON CONFLICT DO NOTHING;


-- ============================================================
-- 6. Verify
-- ============================================================
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;
