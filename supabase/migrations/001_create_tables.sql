-- ============================================================
-- 001: Core Business Tables
-- ============================================================

-- Products (must exist before priceHist and salesDetail FK refs)
CREATE TABLE IF NOT EXISTS product (
  prodcode   VARCHAR(10)  PRIMARY KEY,
  description VARCHAR(100) NOT NULL,
  unit        VARCHAR(20)  NOT NULL
);

-- Price History
CREATE TABLE IF NOT EXISTS pricehist (
  effdate   DATE         NOT NULL,
  prodcode  VARCHAR(10)  NOT NULL REFERENCES product(prodcode),
  unitprice NUMERIC(12,2) NOT NULL CHECK (unitprice >= 0),
  PRIMARY KEY (effdate, prodcode)
);

-- Customers
CREATE TABLE IF NOT EXISTS customer (
  custno        VARCHAR(10)  PRIMARY KEY,
  custname      VARCHAR(100) NOT NULL,
  address       TEXT,
  payterm       VARCHAR(5)   NOT NULL CHECK (payterm IN ('COD','30D','45D')),
  record_status VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE','INACTIVE')),
  stamp         TEXT
);

-- Sales (header)
CREATE TABLE IF NOT EXISTS sales (
  transno   VARCHAR(10) PRIMARY KEY,
  salesdate DATE        NOT NULL,
  custno    VARCHAR(10) REFERENCES customer(custno),
  empno     VARCHAR(10)
);

-- Sales Detail (line items)
CREATE TABLE IF NOT EXISTS salesdetail (
  transno  VARCHAR(10) NOT NULL REFERENCES sales(transno),
  prodcode VARCHAR(10) NOT NULL REFERENCES product(prodcode),
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (transno, prodcode)
);
