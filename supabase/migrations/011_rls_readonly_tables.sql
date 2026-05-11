-- ============================================================
-- 011: RLS — View-Only Tables (sales, salesdetail, product, pricehist)
-- Core Rule 3: SELECT-only. No INSERT/UPDATE/DELETE policies.
-- ============================================================

-- sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_select ON sales
  FOR SELECT USING (has_right('VIEW_SALES'));

-- salesdetail
ALTER TABLE salesdetail ENABLE ROW LEVEL SECURITY;
CREATE POLICY salesdetail_select ON salesdetail
  FOR SELECT USING (has_right('VIEW_SALES'));

-- product
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_select ON product
  FOR SELECT USING (has_right('VIEW_PRODUCTS'));

-- pricehist
ALTER TABLE pricehist ENABLE ROW LEVEL SECURITY;
CREATE POLICY pricehist_select ON pricehist
  FOR SELECT USING (has_right('VIEW_PRODUCTS'));

-- ============================================================
-- Explicitly: NO INSERT, UPDATE, or DELETE policies exist for
-- sales, salesdetail, product, or pricehist. Mutations are
-- blocked by default when RLS is enabled.
-- ============================================================
