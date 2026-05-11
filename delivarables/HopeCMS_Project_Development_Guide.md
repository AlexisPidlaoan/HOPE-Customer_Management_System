# HOPE, INC.
## Customer Management System
### PROJECT DEVELOPMENT GUIDE
**Sprint-Based Capstone Plan | BS Information Technology | 6-Week Delivery**

Prepared by:
**JEREMIAS C. ESPERANZA**
New Era University – College of Computer Studies
Information Management Course
Academic Year 2025–2026

---

## 1. Project Overview

This document is the development guide for the Hope, Inc. Customer Management System — a 6-week capstone project for a 5-member BS Information Technology team. The system manages customers and provides read-only views of their purchase history across the sales, salesDetail, product, and priceHist tables. Only the customer table supports full CRUD operations. All other tables are strictly view-only. The project runs across 3 sprints of 2 weeks each.

### 1.1 Core Rules

> **RULE** No hard deletes. The DELETE keyword must NEVER appear anywhere in application code, Supabase functions, or RLS policies. Customer removals are soft-deletes: set record_status = 'INACTIVE'.

> **RULE** INACTIVE customers are INVISIBLE to USER accounts in all views, lists, and searches. The RLS policy and the React query must both enforce this.

> **RULE** Only ADMIN and SUPERADMIN can see INACTIVE customers and recover them by setting record_status = 'ACTIVE'.

> **RULE** sales, salesDetail, product, and priceHist are VIEW-ONLY for all user types including ADMIN. No add, edit, or delete operations are permitted on these tables through the application.

> **RULE** ADMIN cannot alter the rights or user_type of a SUPERADMIN account. Enforced at both UI and RLS levels.

> **NOTE** Stamps (audit trail strings) are added to the customer table only and hidden from USER accounts. Only SUPERADMIN and ADMIN can see the stamp column.

> **NOTE** Users register via Email/Password or Google OAuth. Both methods auto-provision the account as USER / INACTIVE pending admin activation.

### 1.2 Objectives

- Manage customers: view, add, edit, and soft-delete customer records (custno, custname, address, payterm).
- View sales: display each customer's transaction history from the sales table (transNo, salesDate, empNo).
- View sales details: drill into each transaction to see items purchased from salesDetail joined with product and priceHist.
- View product catalogue: read-only listing of all products with their current prices from priceHist.
- Enforce rights: CRUD rights on customer module; VIEW-only rights on sales, salesDetail, product, and priceHist.
- Soft-delete with recovery: deleted customers hidden from USER; recoverable by ADMIN/SUPERADMIN.

### 1.3 Five Tables at a Glance

| Table | Role in This App | CRUD? | Records in Seed |
|---|---|---|---|
| customer | Primary entity — managed by the app | Full CRUD (no hard delete) | 82 customers |
| sales | Each customer's purchase transactions | View only | 124 transactions |
| salesDetail | Line items per transaction (product + qty) | View only | ~250 line items |
| product | Product catalogue with code and description | View only | 52 products |
| priceHist | Price history per product with effective date | View only | ~70 price entries |

### 1.4 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | Single-page app, component-based UI |
| Styling | Tailwind CSS | Utility-first responsive design |
| Backend / DB | Supabase (PostgreSQL) | Database, Auth, RLS Policies, Triggers |
| Auth | Supabase Auth (Email + Google OAuth) | Email/password + Google OAuth 2.0 sign-in |
| State | React Context API | Global auth session and user-rights map |
| Version Control | Git + GitHub | Source control and team collaboration |
| Deployment | Vercel or Netlify | Free-tier hosted production URL |
| Testing | Vitest + React Testing Library | Unit and integration tests |

---

## 2. Database Design

The application uses the five tables from HopeDB. Two columns — record_status and stamp — are added to the customer table only to support soft-delete and audit trail. The four view-only tables (sales, salesDetail, product, priceHist) are used as-is with no structural changes.

### 2.1 Table: customer (modified — primary managed table)

| Column | Type | Constraint | Notes |
|---|---|---|---|
| custno | VARCHAR(5) | PRIMARY KEY | Customer number, e.g. C0001 |
| custname | VARCHAR(20) | NOT NULL | Customer or company name |
| address | VARCHAR(50) | | Full address |
| payterm | VARCHAR(3) | CHECK ('COD','30D','45D') | Payment terms: Cash on Delivery, 30-day, or 45-day |
| record_status | VARCHAR(10) | DEFAULT 'ACTIVE' | ADDED: ACTIVE = visible, INACTIVE = soft-deleted |
| stamp | VARCHAR(60) | | ADDED: audit string — hidden from USER accounts |

### 2.2 Table: sales (view-only — no changes)

| Column | Type | Constraint | Notes |
|---|---|---|---|
| transNo | VARCHAR(8) | PRIMARY KEY | Transaction number, e.g. TR000001 |
| salesDate | DATE | | Date of sale |
| custNo | VARCHAR(5) | FK → customer | Links to customer — drives customer sales history |
| empNo | VARCHAR(5) | FK → employee | Sales agent who processed the transaction |

### 2.3 Table: salesDetail (view-only — no changes)

| Column | Type | Constraint | Notes |
|---|---|---|---|
| transNo | VARCHAR(8) | PK + FK → sales | Links to parent transaction |
| prodCode | VARCHAR(6) | PK + FK → product | Links to product purchased |
| quantity | DECIMAL(10,2) | CHECK >= 0 | Quantity of this product in the transaction |

### 2.4 Table: product (view-only — no changes)

| Column | Type | Constraint | Notes |
|---|---|---|---|
| prodCode | VARCHAR(6) | PRIMARY KEY | Product code, e.g. AK0001 |
| description | VARCHAR(30) | | Product name/description |
| unit | VARCHAR(3) | CHECK (pc,ea,mtr,pkg,ltr) | Unit of measure |

### 2.5 Table: priceHist (view-only — no changes)

| Column | Type | Constraint | Notes |
|---|---|---|---|
| effDate | DATE | PK (with prodCode) | Effective date of this price |
| prodCode | VARCHAR(6) | PK + FK → product | Links to product |
| unitPrice | DECIMAL(10,2) | CHECK > 0 | Unit price effective from effDate |

### 2.6 Table Relationships

- customer.custno ← sales.custNo (one customer has many sales transactions)
- sales.transNo ← salesDetail.transNo (one transaction has many line items)
- salesDetail.prodCode → product.prodCode (each line item references one product)
- product.prodCode ← priceHist.prodCode (each product has a price history timeline)
- The current price of a product = the priceHist row with the MAX(effDate) for that prodCode.

> **NOTE** Soft-delete scope: only the customer table has record_status. Soft-deleting a customer does NOT hide their sales history from ADMIN/SUPERADMIN — the transaction records remain visible in the Deleted Customer detail view for audit purposes.

### 2.7 Rights & Auth Tables

The same rights management schema as previous systems is used, with modules and rights specific to this application:

| Table | Purpose |
|---|---|
| user | App users: SUPERADMIN, ADMIN (Sales Manager), USER (Sales Staff) |
| Module | Four modules: Cust_Mod, Sales_Mod, Prod_Mod, Adm_Mod |
| user_module | Maps user to module with rights_value (0 or 1) |
| rights | 9 rights: CUST_VIEW/ADD/EDIT/DEL, SALES_VIEW, SD_VIEW, PROD_VIEW, PRICE_VIEW, ADM_USER |
| UserModule_Rights | Maps user to each right with right_value (0 or 1) |

### 2.8 Module and Rights Seed Data

```sql
-- MODULES
INSERT INTO Module VALUES ('Cust_Mod', 'Customer Module', 'ACTIVE', 'SEEDED');
INSERT INTO Module VALUES ('Sales_Mod', 'Sales Module', 'ACTIVE', 'SEEDED');
INSERT INTO Module VALUES ('Prod_Mod', 'Product Module', 'ACTIVE', 'SEEDED');
INSERT INTO Module VALUES ('Adm_Mod', 'Admin Module', 'ACTIVE', 'SEEDED');

-- RIGHTS
INSERT INTO rights VALUES ('CUST_VIEW', 'View Customers', 1,'Cust_Mod', 'ACTIVE','SEEDED');
INSERT INTO rights VALUES ('CUST_ADD', 'Add Customer', 1,'Cust_Mod', 'ACTIVE','SEEDED');
INSERT INTO rights VALUES ('CUST_EDIT', 'Edit Customer', 1,'Cust_Mod', 'ACTIVE','SEEDED');
INSERT INTO rights VALUES ('CUST_DEL', 'Soft Delete Customer', 1,'Cust_Mod', 'ACTIVE','SEEDED');
INSERT INTO rights VALUES ('SALES_VIEW', 'View Sales', 1,'Sales_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('SD_VIEW', 'View Sales Detail', 1,'Sales_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('PROD_VIEW', 'View Products', 1,'Prod_Mod', 'ACTIVE','SEEDED');
INSERT INTO rights VALUES ('PRICE_VIEW', 'View Price History', 1,'Prod_Mod', 'ACTIVE','SEEDED');
INSERT INTO rights VALUES ('ADM_USER', 'Admin Activate User', 1,'Adm_Mod', 'ACTIVE','SEEDED');
```

---

## 3. User Types & Access Rights

### 3.1 User Type Definitions

| user_type | Role in CMS | Default Rights |
|---|---|---|
| SUPERADMIN | Full system control. Can add, edit, and soft-delete customers. Only user who can soft-delete. Cannot be modified by any other user. Default: jcesperanza@neu.edu.ph. | All 9 rights = 1 |
| ADMIN (Sales Manager) | Can add and edit customers. Can view all related tables. Cannot soft-delete customers. Can activate/deactivate USER accounts. Cannot modify SUPERADMIN. | CUST_VIEW=1, CUST_ADD=1, CUST_EDIT=1, CUST_DEL=0; all VIEW rights=1; ADM_USER=1 |
| USER (Sales Staff) | Read-only access. Can view active customers and all their sales data. Cannot add, edit, or delete anything. | CUST_VIEW=1, all other rights=0 except SALES_VIEW=1, SD_VIEW=1, PROD_VIEW=1, PRICE_VIEW=1 |

### 3.2 Rights Matrix

| Right / Feature | SUPERADMIN | ADMIN (Sales Mgr) | USER (Sales Staff) | Table | Access Type |
|---|---|---|---|---|---|
| CUST_VIEW – View Customers | YES | YES | YES | customer | CRUD |
| CUST_ADD – Add Customer | YES | YES | NO | customer | CRUD |
| CUST_EDIT – Edit Customer | YES | YES | NO | customer | CRUD |
| CUST_DEL – Soft Delete Cust. | YES | NO | NO | customer | CRUD |
| SALES_VIEW – View Sales | VIEW ONLY | VIEW ONLY | VIEW ONLY | sales | View Only |
| SD_VIEW – View Sales Details | VIEW ONLY | VIEW ONLY | VIEW ONLY | salesDetail | View Only |
| PROD_VIEW – View Products | VIEW ONLY | VIEW ONLY | VIEW ONLY | product | View Only |
| PRICE_VIEW – View Price Hist. | VIEW ONLY | VIEW ONLY | VIEW ONLY | priceHist | View Only |
| ADM_USER – Activate/Manage Users | YES | NO | NO | (Admin) | CRUD |

> **RULE** VIEW ONLY means the application provides a read-only interface — no add, edit, or delete buttons are ever rendered for sales, salesDetail, product, or priceHist regardless of user type. The RLS policy also restricts these tables to SELECT only for all authenticated users.

### 3.3 Soft Delete & Visibility Rules

| record_status | Visible to USER? | Visible to ADMIN? | Visible to SUPERADMIN? | Can Recover? |
|---|---|---|---|---|
| ACTIVE | Yes — all customer views | Yes — all views | Yes — all views | N/A |
| INACTIVE | No — never shown | Yes — Deleted Customers panel | Yes — Deleted Customers panel | ADMIN + SUPERADMIN |

### 3.4 Stamp Visibility

| user_type | Can See Stamp? | Notes |
|---|---|---|
| SUPERADMIN | Yes — customer table | Full audit visibility |
| ADMIN | Yes — customer table | Operational audit access |
| USER | No — stamp column hidden | No operational need for audit data |

---

## 4. Authentication & Registration Flow

The system supports Email/Password and Google OAuth. Both methods trigger the same auto-provisioning trigger, creating the account as USER / INACTIVE pending admin activation.

### 4.1 Registration & Provisioning Steps

1. User opens the app and registers via email form or clicks 'Sign in with Google'.
2. Email path: Supabase sends confirmation email → user clicks link → trigger fires.
3. Google path: user selects Google account → Supabase creates auth user → trigger fires immediately.
4. Trigger provision_new_user() automatically:
   - Inserts user row: user_type = 'USER', record_status = 'INACTIVE'
   - Inserts user_module rows: Cust_Mod=1, Sales_Mod=1, Prod_Mod=1, Adm_Mod=0
   - Inserts UserModule_Rights: CUST_VIEW=1, SALES_VIEW=1, SD_VIEW=1, PROD_VIEW=1, PRICE_VIEW=1; all add/edit/delete/admin rights=0
5. Login guard blocks access: checks record_status = 'ACTIVE' on every sign-in.
6. ADMIN or SUPERADMIN activates the account via Admin Module.
7. User logs in and can browse active customers and their sales history.

### 4.2 Login Guard

```javascript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    const { data: userRow } = await supabase
      .from('user').select('record_status, user_type, username')
      .eq('userId', session.user.id).single();
    if (userRow?.record_status !== 'ACTIVE') {
      await supabase.auth.signOut();
      setError('Your account is pending activation by a Sales Manager.');
    } else { setCurrentUser({ ...session.user, ...userRow }); }
  }
});
```

### 4.3 SUPERADMIN Seed

| Field | Value |
|---|---|
| Email | jcesperanza@neu.edu.ph |
| userId | user1 |
| user_type | SUPERADMIN |
| record_status | ACTIVE |
| All 9 Rights | right_value = 1 |
| Password | Set via Supabase Dashboard invite or manual reset |

---

## 5. Team Composition & Roles

| # | Role | Responsibilities | Key Technologies |
|---|---|---|---|
| M1 | Project Lead / Full-Stack | Sprint coordination, GitHub management, Supabase setup, API service wiring, routing, deployment. | React, Supabase, Vite, GitHub |
| M2 | Frontend Developer (UI/UX) | All React pages: Login, Register, Customer List, Customer CRUD, Sales History, Sales Detail, View-only pages, Deleted Customers panel. | React, Tailwind CSS |
| M3 | Backend / DB Engineer | Supabase schema, SQL migrations (add columns), RLS policies for all tables, SQL views for reports and sales summaries, triggers. | PostgreSQL, Supabase SQL |
| M4 | Rights & Auth Specialist | UserRightsContext, useRights() hook, rights-gated UI, Google OAuth + email auth, login guard, account activation. | React Context, Supabase Auth |
| M5 | QA / Documentation | Test cases for all rights and soft-delete visibility, view-only enforcement tests, user manual, sprint log, presentation slides. | Vitest, Manual Testing |

---

## 6. Sprint Plan — 3 Sprints × 2 Weeks (6 Weeks Total)

### Sprint 1 – Weeks 1–2: Setup, Database & Authentication

**Goal:** Dev environment ready, Supabase initialized with all 5 tables and seed data (82 customers, 124 sales, 52 products), email + Google OAuth working, login guard active.

| Member | Role | Task | Deliverable | Week |
|---|---|---|---|---|
| M1 | Project Lead | Scaffold Vite + React + Tailwind; configure GitHub (main/dev/feature/*); initialize Supabase JS client; set up React Router v6 with ProtectedRoute; wire placeholder pages for /customers, /sales, /products, /admin, /deleted-customers, /auth/callback; protect dev and main branches in GitHub | Working scaffold + protected routing on GitHub | Wks 1–2 |
| M2 | Frontend Dev | Build Login page (email form + 'Sign in with Google' button); Register page (email + Google); AppShell with navbar (logged-in user + logout) and sidebar (Customer, Sales, Products, Admin, Deleted Customers links); /auth/callback loading page; all pages responsive | Login + Register + App shell | Wks 1–2 |
| M3 | DB Engineer | Create Supabase project; run HopeDB SQL for all 5 tables (customer, sales, salesDetail, product, priceHist) with full seed data; run Rights Scripts (user, Module, user_module, rights, UserModule_Rights); add record_status + stamp to customer table only; seed 4 modules and 9 rights; seed SUPERADMIN jcesperanza@neu.edu.ph with all 9 rights = 1; commit migration files to /db/migrations | Fully seeded Supabase database + migration files | Wks 1–2 |
| M4 | Rights & Auth | Implement AuthContext (onAuthStateChange, currentUser, signOut); wire email signUp() + signIn(); wire Google signInWithOAuth(); build /auth/callback route with login guard; write provision_new_user() trigger (USER/INACTIVE, VIEW rights + CUST_VIEW = 1, all CRUD rights = 0); configure Google OAuth in Google Cloud + Supabase; add redirect URLs for localhost and production | AuthContext + Google OAuth + trigger + login guard | Wks 1–2 |
| M5 | QA / Docs | Install Vitest; write test cases for email registration, Google OAuth, login guard (INACTIVE block + ACTIVE pass); document DB schema with ERD; create sprint log template; update README with setup instructions | Test setup + ERD + README + sprint log | Wks 1–2 |

### Sprint 2 – Weeks 3–4: Customer CRUD, Sales Views & Rights Enforcement

**Goal:** Full customer CRUD (add/edit/soft-delete) gated by rights; read-only views for sales, salesDetail, product, and priceHist; soft-delete visibility enforced; stamp hidden from USER; Deleted Customers panel for ADMIN/SUPERADMIN.

| Member | Role | Task | Deliverable | Week |
|---|---|---|---|---|
| M1 | Project Lead | Wire all customer API service functions: getCustomers(userType), addCustomer(), updateCustomer(), softDeleteCustomer(), recoverCustomer(); wire view-only service functions: getSalesByCustomer(custNo), getSalesDetail(transNo), getProducts(), getPriceHistory(prodCode); getCustomers() filters record_status='ACTIVE' when userType='USER'; integrate UserRightsContext; add /deleted-customers route guard blocking USER | All API service functions + route guard | Wks 3–4 |
| M2 | Frontend Dev | Build CustomerListPage (table: custno, custname, address, payterm; stamp column for ADMIN+ only; INACTIVE rows hidden for USER); AddCustomerModal (CUST_ADD gated); EditCustomerModal (CUST_EDIT gated); SoftDeleteConfirmDialog (CUST_DEL gated — SUPERADMIN only); CustomerDetailPage with embedded SalesHistoryPanel (list of transactions: transNo, salesDate, empNo); SalesDetailModal (click a transaction to see line items: product description, qty, unit price from priceHist); ProductCataloguePage (read-only: prodCode, description, unit, current price); DeletedCustomersPage (INACTIVE customers with Recover button); sidebar Deleted Customers link hidden for USER | Customer CRUD + Sales views + Deleted Customers panel | Wks 3–4 |
| M3 | DB Engineer | RLS on customer — SELECT: USER sees ACTIVE only, ADMIN/SA see all; INSERT (CUST_ADD=1); UPDATE-edit (CUST_EDIT=1); UPDATE record_status to INACTIVE (CUST_DEL=1); UPDATE record_status to ACTIVE / recovery (ADMIN/SUPERADMIN only); RLS on sales, salesDetail, product, priceHist: SELECT only for all authenticated users — no INSERT/UPDATE/DELETE allowed on any of these tables; SQL view customer_sales_summary (total transactions + total spend per customer); SQL view product_current_price (latest priceHist entry per product) | RLS for all 5 tables + 2 SQL views | Wks 3–4 |
| M4 | Rights & Auth | Build UserRightsContext (query all 9 rights on login); useRights() hook; gate Add button (CUST_ADD); gate Edit button (CUST_EDIT); gate Delete button (CUST_DEL — visible only to SUPERADMIN); hide stamp column when user_type='USER'; hide Deleted Customers sidebar link for USER; /deleted-customers route guard; confirm no add/edit/delete buttons rendered anywhere for sales, salesDetail, product, or priceHist pages | UserRightsContext + 9-right gating + stamp + view-only enforcement | Wks 3–4 |
| M5 | QA / Docs | Execute rights test matrix (3 user types × 9 rights = 27 test cases); test soft-delete visibility (INACTIVE customer invisible to USER in list and via direct API); test recovery; confirm view-only tables (sales, salesDetail, product, priceHist) have zero add/edit/delete buttons across all user types; verify no DELETE SQL anywhere in codebase; verify stamp hidden for USER; Sprint 2 log | 27-case rights matrix + visibility + view-only enforcement test report | Wks 3–4 |

### Sprint 3 – Weeks 5–6: Admin Module, Reports, Deployment & Documentation

**Goal:** Admin user management, CMS reports (sales summary, top customers), production deployment, SUPERADMIN protection, final documentation.

| Member | Role | Task | Deliverable | Week |
|---|---|---|---|---|
| M1 | Project Lead | Wire Admin Module API: getUsers(), activateUser(), deactivateUser() — block SUPERADMIN rows; wire reports API: getCustomerSalesSummary() from customer_sales_summary view, getTopCustomers() (top 10 by transaction count or total spend), getProductRevenue() (total revenue per product from salesDetail × priceHist); deploy to Vercel/Netlify with production env vars; create release PR dev → main | Live deployed app + reports API + final merge | Wks 5–6 |
| M2 | Frontend Dev | Build UserManagementPage (user list with Activate/Deactivate buttons; SUPERADMIN rows disabled with tooltip); CustomerSalesSummaryPage (table: customer name, transaction count, total spend, last sale date); TopCustomersPage (ranked list or chart: top 10 customers by spend); ProductRevenuePage (table: product description, total qty sold, total revenue — read-only); final UI polish (loading states, empty states, error messages, mobile responsive) | Admin UI + 3 report pages + final polish | Wks 5–6 |
| M3 | DB Engineer | SQL view customer_sales_summary: JOIN customer + sales + salesDetail + priceHist to compute total transactions + total spend per customer (ACTIVE customers only for USER); SQL view product_revenue: total qty sold and total revenue per product; RLS for Admin Module: ADMIN can UPDATE user.record_status only WHERE user_type != 'SUPERADMIN'; ADMIN cannot UPDATE UserModule_Rights for SUPERADMIN users; final RLS audit — no dev bypasses; confirm no DELETE statements anywhere | Report views + Admin RLS + final audit | Wks 5–6 |
| M4 | Rights & Auth | Gate Admin sidebar link (ADM_USER=1 only); disable all action buttons on SUPERADMIN rows in UserManagementPage with tooltip; end-to-end rights regression in production (all 3 user types, all 9 rights, all 5 table views); verify Google OAuth works in production; confirm ADMIN cannot touch SUPERADMIN at UI and DB level | Full rights regression + SUPERADMIN protection | Wks 5–6 |
| M5 | QA / Docs | Full end-to-end test in production: all 3 user types, customer CRUD, sales drill-down, all reports, admin activation; SUPERADMIN protection test; confirm view-only tables show no mutation buttons in production; finalize User Manual (registration, login, customer management, sales history navigation, reports, admin); finalize Sprint Guide; prepare 12-slide presentation deck | User Manual + Sprint Guide + Presentation Slides | Wks 5–6 |

---

## 7. Key SQL Patterns & Views

### 7.1 Customer Visibility RLS (SELECT)

```sql
CREATE POLICY cust_visibility ON customer FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM public.user
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);
```

### 7.2 View-Only RLS (sales, salesDetail, product, priceHist)

```sql
-- Apply this pattern to all 4 view-only tables
-- Example for sales:
CREATE POLICY sales_select_only ON sales FOR SELECT TO authenticated USING (true);
-- No INSERT, UPDATE, or DELETE policies are created for these tables.
-- Absence of an INSERT/UPDATE/DELETE policy means those operations are blocked by default.
```

### 7.3 Current Price per Product

```sql
CREATE VIEW product_current_price AS
SELECT p.prodCode, p.description, p.unit,
  ph.unitPrice, ph.effDate AS priceEffDate
FROM product p
JOIN priceHist ph ON ph.prodCode = p.prodCode
WHERE ph.effDate = (
  SELECT MAX(effDate) FROM priceHist WHERE prodCode = p.prodCode
)
ORDER BY p.prodCode;
```

### 7.4 Customer Sales Summary

```sql
CREATE VIEW customer_sales_summary AS
SELECT c.custno, c.custname, c.payterm, c.record_status,
  COUNT(DISTINCT s.transNo) AS totalTransactions,
  SUM(sd.quantity * ph.unitPrice) AS totalSpend,
  MAX(s.salesDate) AS lastSaleDate
FROM customer c
LEFT JOIN sales s ON s.custNo = c.custno
LEFT JOIN salesDetail sd ON sd.transNo = s.transNo
LEFT JOIN (
  SELECT prodCode, unitPrice FROM priceHist ph1
  WHERE effDate = (SELECT MAX(effDate) FROM priceHist WHERE prodCode = ph1.prodCode)
) ph ON ph.prodCode = sd.prodCode
GROUP BY c.custno, c.custname, c.payterm, c.record_status
ORDER BY totalSpend DESC NULLS LAST;
```

### 7.5 Product Revenue

```sql
CREATE VIEW product_revenue AS
SELECT p.prodCode, p.description, p.unit,
  SUM(sd.quantity) AS totalQtySold,
  SUM(sd.quantity * ph.unitPrice) AS totalRevenue
FROM product p
JOIN salesDetail sd ON sd.prodCode = p.prodCode
JOIN (
  SELECT prodCode, unitPrice FROM priceHist ph1
  WHERE effDate = (SELECT MAX(effDate) FROM priceHist WHERE prodCode = ph1.prodCode)
) ph ON ph.prodCode = p.prodCode
GROUP BY p.prodCode, p.description, p.unit
ORDER BY totalRevenue DESC;
```

### 7.6 Soft Delete & Recovery

```javascript
// Soft delete
export async function softDeleteCustomer(custno, userId) {
  const { error } = await supabase.from('customer')
    .update({ record_status: 'INACTIVE', stamp: makeStamp('DEACTIVATED', userId) })
    .eq('custno', custno);
  return error;
}

// Recovery
export async function recoverCustomer(custno, userId) {
  const { error } = await supabase.from('customer')
    .update({ record_status: 'ACTIVE', stamp: makeStamp('REACTIVATED', userId) })
    .eq('custno', custno);
  return error;
}

// Get customers — filtered by user type
export async function getCustomers(userType) {
  let q = supabase.from('customer').select('*').order('custno');
  if (userType === 'USER') q = q.eq('record_status','ACTIVE');
  const { data } = await q;
  return data;
}
```

---

## 8. Definition of Done — Final Checklist

- Supabase project created; all 5 tables seeded (82 customers, 124 sales, ~250 detail rows, 52 products, ~70 price entries)
- record_status and stamp added to customer table only; 4 view-only tables unchanged
- 4 modules and 9 rights seeded in Module and rights tables
- SUPERADMIN jcesperanza@neu.edu.ph seeded with all 9 rights = 1
- Email/password registration with email confirmation working
- Google OAuth configured and working in production
- provision_new_user() trigger creates USER / INACTIVE with VIEW rights + CUST_VIEW = 1
- Login guard blocks INACTIVE accounts for both auth methods
- INACTIVE customers invisible to USER in list view AND via direct Supabase API call (RLS enforces)
- Deleted Customers panel visible to ADMIN and SUPERADMIN only
- Deleted Customers sidebar link hidden for USER accounts
- /deleted-customers route blocked for USER accounts via route guard
- Stamp column hidden from USER in customer table view
- Add Customer button visible only when CUST_ADD = 1 (SUPERADMIN + ADMIN)
- Edit Customer button visible only when CUST_EDIT = 1 (SUPERADMIN + ADMIN)
- Delete (soft) button visible only when CUST_DEL = 1 (SUPERADMIN only)
- ADMIN cannot soft-delete customers (CUST_DEL = 0 for ADMIN)
- sales, salesDetail, product, priceHist pages have ZERO add/edit/delete buttons for ALL user types
- RLS on view-only tables: SELECT only — no INSERT/UPDATE/DELETE policies exist
- CustomerDetailPage shows embedded sales history list per customer
- Sales transaction drill-down shows salesDetail joined with product description and current price
- Reports: Customer Sales Summary, Top Customers, Product Revenue all working
- ADMIN cannot modify SUPERADMIN account (UI disabled + RLS blocks)
- No DELETE SQL statement anywhere in application code or Supabase functions
- App deployed to Vercel or Netlify with production environment variables
- User Manual, Sprint Log, and Presentation Slides submitted

---

*— End of Document —*
