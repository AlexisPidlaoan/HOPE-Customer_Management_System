-- ============================================================
-- HopeCMS Frontend Compatibility Patch
-- Run this in Supabase SQL Editor AFTER HopeDB_Supabase_Full.sql
-- ============================================================

-- 1. Add record_status to customer (required by the React UI for soft-delete)
ALTER TABLE public.customer 
ADD COLUMN IF NOT EXISTS record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' 
CHECK (record_status IN ('ACTIVE','INACTIVE'));

-- 2. Add stamp to customer (optional but used in some UI tables)
ALTER TABLE public.customer 
ADD COLUMN IF NOT EXISTS stamp TEXT;

-- 3. Create product_current_price view (Used by ProductCataloguePage)
CREATE OR REPLACE VIEW product_current_price AS
SELECT
  p.prodCode AS prodcode,
  p.description,
  p.unit,
  ph.unitPrice AS current_price,
  ph.effDate   AS price_as_of
FROM product p
JOIN priceHist ph ON ph.prodCode = p.prodCode
WHERE ph.effDate = (
  SELECT MAX(ph2.effDate)
  FROM priceHist ph2
  WHERE ph2.prodCode = p.prodCode
);

-- 4. Create customer_sales_summary view (Used by CustomerListPage if applicable)
CREATE OR REPLACE VIEW customer_sales_summary AS
SELECT
  c.custno,
  c.custname,
  c.address,
  c.payterm,
  COUNT(DISTINCT s.transNo)                          AS total_transactions,
  COALESCE(SUM(sd.quantity * ph.unitPrice), 0)       AS total_spend
FROM customer c
LEFT JOIN sales s ON s.custno = c.custno
LEFT JOIN salesDetail sd ON sd.transNo = s.transNo
LEFT JOIN (
  SELECT ph1.prodCode, ph1.unitPrice, ph1.effDate
  FROM priceHist ph1
  WHERE ph1.effDate = (
    SELECT MAX(ph2.effDate) FROM priceHist ph2 WHERE ph2.prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
WHERE c.record_status = 'ACTIVE'
GROUP BY c.custno, c.custname, c.address, c.payterm;

-- 5. Create product_revenue view
CREATE OR REPLACE VIEW product_revenue AS
SELECT
  p.prodCode AS prodcode,
  p.description,
  p.unit,
  COALESCE(SUM(sd.quantity), 0)                        AS total_qty_sold,
  COALESCE(SUM(sd.quantity * pcp.current_price), 0)    AS total_revenue
FROM product p
LEFT JOIN salesDetail sd ON sd.prodCode = p.prodCode
LEFT JOIN product_current_price pcp ON pcp.prodcode = p.prodCode
GROUP BY p.prodCode, p.description, p.unit, pcp.current_price
ORDER BY total_revenue DESC;
