-- =============================================================
-- HopeCMS | PR-04: db/verify-seed
-- Seed Verification Queries (Row Counts + FK Checks)
-- Branch: db/verify-seed (forked from dev)
-- Author: M3 – DB Engineer
-- =============================================================


-- ─────────────────────────────────────────
-- 1. ROW COUNT CHECKS
-- ─────────────────────────────────────────

-- Expected: 82
SELECT COUNT(*) AS customer_count FROM public.customer;

-- Expected: 124
SELECT COUNT(*) AS sales_count FROM public.sales;

-- Expected: ~250
SELECT COUNT(*) AS salesDetail_count FROM public."salesDetail";

-- Expected: 52
SELECT COUNT(*) AS product_count FROM public.product;

-- Expected: ~70
SELECT COUNT(*) AS priceHist_count FROM public."priceHist";

-- Expected: 4
SELECT COUNT(*) AS module_count FROM public."Module";

-- Expected: 9
SELECT COUNT(*) AS rights_count FROM public.rights;

-- Expected: 1
SELECT COUNT(*) AS superadmin_count
FROM public."user"
WHERE user_type = 'SUPERADMIN';


-- ─────────────────────────────────────────
-- 2. SUPERADMIN SEED CHECK
-- ─────────────────────────────────────────

-- Expected: user1 / jcesperanza@neu.edu.ph / SUPERADMIN / ACTIVE
SELECT userId, username, email, user_type, record_status
FROM public."user"
WHERE userId = 'user1';

-- Expected: 4 rows, all rights_value = 1
SELECT userId, moduleCode, rights_value
FROM public.user_module
WHERE userId = 'user1';

-- Expected: 9 rows, all right_value = 1
SELECT userId, rightCode, right_value
FROM public."UserModule_Rights"
WHERE userId = 'user1';


-- ─────────────────────────────────────────
-- 3. FOREIGN KEY CHECKS
-- ─────────────────────────────────────────

-- sales.custNo must match a valid customer.custno
-- Expected: 0 orphan rows
SELECT COUNT(*) AS orphan_sales
FROM public.sales s
WHERE NOT EXISTS (
    SELECT 1 FROM public.customer c WHERE c.custno = s."custNo"
);

-- salesDetail.transNo must match a valid sales.transNo
-- Expected: 0 orphan rows
SELECT COUNT(*) AS orphan_salesDetail_transNo
FROM public."salesDetail" sd
WHERE NOT EXISTS (
    SELECT 1 FROM public.sales s WHERE s."transNo" = sd."transNo"
);

-- salesDetail.prodCode must match a valid product.prodCode
-- Expected: 0 orphan rows
SELECT COUNT(*) AS orphan_salesDetail_prodCode
FROM public."salesDetail" sd
WHERE NOT EXISTS (
    SELECT 1 FROM public.product p WHERE p."prodCode" = sd."prodCode"
);

-- priceHist.prodCode must match a valid product.prodCode
-- Expected: 0 orphan rows
SELECT COUNT(*) AS orphan_priceHist
FROM public."priceHist" ph
WHERE NOT EXISTS (
    SELECT 1 FROM public.product p WHERE p."prodCode" = ph."prodCode"
);

-- rights.moduleCode must match a valid Module.moduleCode
-- Expected: 0 orphan rows
SELECT COUNT(*) AS orphan_rights
FROM public.rights r
WHERE NOT EXISTS (
    SELECT 1 FROM public."Module" m WHERE m."moduleCode" = r."moduleCode"
);


-- ─────────────────────────────────────────
-- 4. CUSTOMER TABLE COLUMN CHECK
-- ─────────────────────────────────────────

-- Confirm record_status and stamp columns exist on customer only
-- Expected: record_status and stamp appear in the result
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'customer'
  AND column_name IN ('record_status', 'stamp');

-- Confirm record_status DEFAULT is 'ACTIVE'
-- Expected: at least 82 rows with record_status = 'ACTIVE'
SELECT COUNT(*) AS active_customers
FROM public.customer
WHERE record_status = 'ACTIVE';


-- ─────────────────────────────────────────
-- 5. MODULES AND RIGHTS CONTENT CHECK
-- ─────────────────────────────────────────

-- List all modules — Expected: Cust_Mod, Sales_Mod, Prod_Mod, Adm_Mod
SELECT moduleCode, moduleDesc, record_status FROM public."Module";

-- List all rights — Expected: 9 rights across 4 modules
SELECT rightCode, rightDesc, moduleCode, record_status FROM public.rights ORDER BY moduleCode;
