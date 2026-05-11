-- ============================================================
-- 002: Auth / Rights Schema
-- ============================================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT         NOT NULL,
  full_name     TEXT,
  user_type     VARCHAR(15)  NOT NULL DEFAULT 'USER'     CHECK (user_type IN ('USER','ADMIN','SUPERADMIN')),
  record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE' CHECK (record_status IN ('ACTIVE','INACTIVE')),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Application modules
CREATE TABLE IF NOT EXISTS modules (
  id          SERIAL      PRIMARY KEY,
  module_name VARCHAR(50) NOT NULL UNIQUE
);

-- Granular rights (linked to a module)
CREATE TABLE IF NOT EXISTS rights (
  id          SERIAL      PRIMARY KEY,
  right_name  VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  module_id   INTEGER     REFERENCES modules(id)
);

-- Junction: which rights a user has
CREATE TABLE IF NOT EXISTS user_module_rights (
  id       SERIAL  PRIMARY KEY,
  user_id  UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  right_id INTEGER NOT NULL REFERENCES rights(id),
  UNIQUE (user_id, right_id)
);
