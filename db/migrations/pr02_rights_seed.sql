-- =============================================================
-- HopeCMS | PR-02: db/rights-seed
-- Rights & Auth Tables + Seed Data
-- Branch: db/rights-seed (forked from dev)
-- Author: M3 – DB Engineer
-- =============================================================


-- ─────────────────────────────────────────
-- 1. TABLE: user
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."user" (
    userId        VARCHAR(50)  PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    user_type     VARCHAR(20)  NOT NULL CHECK (user_type IN ('SUPERADMIN', 'ADMIN', 'USER')),
    record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
    stamp         VARCHAR(60),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────
-- 2. TABLE: Module
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."Module" (
    moduleCode    VARCHAR(20)  PRIMARY KEY,
    moduleDesc    VARCHAR(50)  NOT NULL,
    record_status VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
    stamp         VARCHAR(60)
);


-- ─────────────────────────────────────────
-- 3. TABLE: user_module
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_module (
    userId        VARCHAR(50)  NOT NULL REFERENCES public."user"(userId) ON DELETE CASCADE,
    moduleCode    VARCHAR(20)  NOT NULL REFERENCES public."Module"(moduleCode) ON DELETE CASCADE,
    rights_value  SMALLINT     NOT NULL DEFAULT 0 CHECK (rights_value IN (0, 1)),
    PRIMARY KEY (userId, moduleCode)
);


-- ─────────────────────────────────────────
-- 4. TABLE: rights
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rights (
    rightCode     VARCHAR(20)  PRIMARY KEY,
    rightDesc     VARCHAR(50)  NOT NULL,
    right_value   SMALLINT     NOT NULL DEFAULT 1 CHECK (right_value IN (0, 1)),
    moduleCode    VARCHAR(20)  NOT NULL REFERENCES public."Module"(moduleCode) ON DELETE CASCADE,
    record_status VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
    stamp         VARCHAR(60)
);


-- ─────────────────────────────────────────
-- 5. TABLE: UserModule_Rights
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."UserModule_Rights" (
    userId        VARCHAR(50)  NOT NULL REFERENCES public."user"(userId) ON DELETE CASCADE,
    rightCode     VARCHAR(20)  NOT NULL REFERENCES public.rights(rightCode) ON DELETE CASCADE,
    right_value   SMALLINT     NOT NULL DEFAULT 0 CHECK (right_value IN (0, 1)),
    PRIMARY KEY (userId, rightCode)
);


-- =============================================================
-- SEED DATA
-- =============================================================


-- ─────────────────────────────────────────
-- 6. SEED: 4 Modules
-- ─────────────────────────────────────────
INSERT INTO public."Module" (moduleCode, moduleDesc, record_status, stamp) VALUES
    ('Cust_Mod',  'Customer Module', 'ACTIVE', 'SEEDED'),
    ('Sales_Mod', 'Sales Module',    'ACTIVE', 'SEEDED'),
    ('Prod_Mod',  'Product Module',  'ACTIVE', 'SEEDED'),
    ('Adm_Mod',   'Admin Module',    'ACTIVE', 'SEEDED')
ON CONFLICT (moduleCode) DO NOTHING;


-- ─────────────────────────────────────────
-- 7. SEED: 9 Rights
-- ─────────────────────────────────────────
INSERT INTO public.rights (rightCode, rightDesc, right_value, moduleCode, record_status, stamp) VALUES
    ('CUST_VIEW',  'View Customers',       1, 'Cust_Mod',  'ACTIVE', 'SEEDED'),
    ('CUST_ADD',   'Add Customer',         1, 'Cust_Mod',  'ACTIVE', 'SEEDED'),
    ('CUST_EDIT',  'Edit Customer',        1, 'Cust_Mod',  'ACTIVE', 'SEEDED'),
    ('CUST_DEL',   'Soft Delete Customer', 1, 'Cust_Mod',  'ACTIVE', 'SEEDED'),
    ('SALES_VIEW', 'View Sales',           1, 'Sales_Mod', 'ACTIVE', 'SEEDED'),
    ('SD_VIEW',    'View Sales Detail',    1, 'Sales_Mod', 'ACTIVE', 'SEEDED'),
    ('PROD_VIEW',  'View Products',        1, 'Prod_Mod',  'ACTIVE', 'SEEDED'),
    ('PRICE_VIEW', 'View Price History',   1, 'Prod_Mod',  'ACTIVE', 'SEEDED'),
    ('ADM_USER',   'Admin Activate User',  1, 'Adm_Mod',   'ACTIVE', 'SEEDED')
ON CONFLICT (rightCode) DO NOTHING;


-- ─────────────────────────────────────────
-- 8. SEED: SUPERADMIN user
-- ─────────────────────────────────────────
INSERT INTO public."user" (userId, username, email, user_type, record_status, stamp) VALUES
    ('user1', 'jcesperanza', 'jcesperanza@neu.edu.ph', 'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (userId) DO NOTHING;


-- ─────────────────────────────────────────
-- 9. SEED: SUPERADMIN → user_module (all 4 modules, rights_value = 1)
-- ─────────────────────────────────────────
INSERT INTO public.user_module (userId, moduleCode, rights_value) VALUES
    ('user1', 'Cust_Mod',  1),
    ('user1', 'Sales_Mod', 1),
    ('user1', 'Prod_Mod',  1),
    ('user1', 'Adm_Mod',   1)
ON CONFLICT (userId, moduleCode) DO NOTHING;


-- ─────────────────────────────────────────
-- 10. SEED: SUPERADMIN → UserModule_Rights (all 9 rights = 1)
-- ─────────────────────────────────────────
INSERT INTO public."UserModule_Rights" (userId, rightCode, right_value) VALUES
    ('user1', 'CUST_VIEW',  1),
    ('user1', 'CUST_ADD',   1),
    ('user1', 'CUST_EDIT',  1),
    ('user1', 'CUST_DEL',   1),
    ('user1', 'SALES_VIEW', 1),
    ('user1', 'SD_VIEW',    1),
    ('user1', 'PROD_VIEW',  1),
    ('user1', 'PRICE_VIEW', 1),
    ('user1', 'ADM_USER',   1)
ON CONFLICT (userId, rightCode) DO NOTHING;


-- =============================================================
-- VERIFICATION QUERIES (run after seeding to confirm)
-- =============================================================

-- Expected: 4
SELECT COUNT(*) AS module_count FROM public."Module";

-- Expected: 9
SELECT COUNT(*) AS rights_count FROM public.rights;

-- Expected: 1 row — user1 / SUPERADMIN / ACTIVE
SELECT userId, username, email, user_type, record_status
FROM public."user"
WHERE userId = 'user1';

-- Expected: 4 rows, all rights_value = 1
SELECT * FROM public.user_module WHERE userId = 'user1';

-- Expected: 9 rows, all right_value = 1
SELECT * FROM public."UserModule_Rights" WHERE userId = 'user1';
