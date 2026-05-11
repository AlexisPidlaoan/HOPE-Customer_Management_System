-- ============================================================
-- 013: SQL Views
-- ============================================================

-- View 1: product_current_price
-- Joins product with the latest (MAX effdate) price from pricehist
CREATE OR REPLACE VIEW product_current_price AS
SELECT
  p.prodcode,
  p.description,
  p.unit,
  ph.unitprice AS current_price,
  ph.effdate   AS price_as_of
FROM product p
JOIN pricehist ph ON ph.prodcode = p.prodcode
WHERE ph.effdate = (
  SELECT MAX(ph2.effdate)
  FROM pricehist ph2
  WHERE ph2.prodcode = p.prodcode
);

-- View 2: customer_sales_summary
-- Aggregates transaction count and total spend per customer
CREATE OR REPLACE VIEW customer_sales_summary AS
SELECT
  c.custno,
  c.custname,
  c.address,
  c.payterm,
  COUNT(DISTINCT s.transno)                          AS total_transactions,
  COALESCE(SUM(sd.quantity * ph.unitprice), 0)       AS total_spend
FROM customer c
LEFT JOIN sales s ON s.custno = c.custno
LEFT JOIN salesdetail sd ON sd.transno = s.transno
LEFT JOIN (
  SELECT ph1.prodcode, ph1.unitprice, ph1.effdate
  FROM pricehist ph1
  WHERE ph1.effdate = (
    SELECT MAX(ph2.effdate) FROM pricehist ph2 WHERE ph2.prodcode = ph1.prodcode
  )
) ph ON ph.prodcode = sd.prodcode
WHERE c.record_status = 'ACTIVE'
GROUP BY c.custno, c.custname, c.address, c.payterm;

-- View 3: product_revenue
-- Aggregates total quantity sold and revenue per product
CREATE OR REPLACE VIEW product_revenue AS
SELECT
  p.prodcode,
  p.description,
  p.unit,
  COALESCE(SUM(sd.quantity), 0)                        AS total_qty_sold,
  COALESCE(SUM(sd.quantity * pcp.current_price), 0)    AS total_revenue
FROM product p
LEFT JOIN salesdetail sd ON sd.prodcode = p.prodcode
LEFT JOIN product_current_price pcp ON pcp.prodcode = p.prodcode
GROUP BY p.prodcode, p.description, p.unit
ORDER BY total_revenue DESC;
