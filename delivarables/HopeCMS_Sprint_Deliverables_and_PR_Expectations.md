# HOPE, INC.
## Customer Management System
### SPRINT DELIVERABLES & PULL REQUEST EXPECTATIONS
**Per Role | Per Sprint | 6-Week Project Plan**

Prepared by:
**JEREMIAS C. ESPERANZA**
New Era University – College of Computer Studies
Academic Year 2025–2026

---

## 1. How to Read This Document

This document defines what each team member must deliver at the end of every sprint and the minimum number of Pull Requests (PRs) they must merge. It is a companion to the CMS Project Development Guide.

> **INFO** Each role card shows: (1) member label and minimum PR count, (2) expected tangible outputs, (3) named PRs with suggested branch names.

> **NOTE** A PR counts only when reviewed by at least one teammate and merged into dev. Draft or unmerged PRs do not count.

> **RULE** Never merge directly into main. Flow: feature branch → PR → dev → release PR → main.

### 1.1 Member Color Legend

| M1 Project Lead | M2 Frontend Dev | M3 DB Engineer | M4 Rights & Auth | M5 QA / Docs |
|---|---|---|---|---|

### 1.2 CMS-Specific PR Rules

- The four view-only tables (sales, salesDetail, product, priceHist) require their own db/ PR confirming SELECT-only RLS — no INSERT/UPDATE/DELETE policies should exist for them.
- Any SQL view (customer_sales_summary, product_current_price, product_revenue) is its own db/ PR committed with a verification query showing expected output.
- The 27-case rights test matrix (3 user types × 9 rights) is a single test/ PR in Sprint 2.
- A dedicated test/ PR in Sprint 2 must confirm that view-only pages (Sales, Products) render zero add/edit/delete buttons for ALL three user types.

---

## 2. Grand Summary — PRs per Member per Sprint

| Member / Role | Sprint 1 | Sprint 2 | Sprint 3 | Total PRs | Min/Sprint | Branch Prefix |
|---|---|---|---|---|---|---|
| M1 – Project Lead | 4 | 4 | 3 | 11 | 2 | feat/*, chore/* |
| M2 – Frontend Developer | 4 | 5 | 3 | 12 | 2 | feat/ui-*, fix/ui-* |
| M3 – DB Engineer | 4 | 4 | 3 | 11 | 2 | db/*, fix/db-* |
| M4 – Rights & Auth | 4 | 3 | 3 | 10 | 2 | feat/auth-*, feat/rights-* |
| M5 – QA / Docs | 2 | 2 | 3 | 7 | 2 | test/*, docs/* |

> **NOTE** Team total: minimum 51 PRs across 6 weeks. Average 1.7 PRs per member per week. M2 carries 12 PRs due to customer CRUD modals, the sales drill-down panel, and the Deleted Customers page.

---

## 3. Sprint 1 — Weeks 1 & 2

**Theme:** Project setup, full CMS database (82 customers, 124 sales, 52 products), Email + Google OAuth, login guard.

> **SPRINT 1** — Project Setup, CMS Database & Authentication | Weeks 1 – 2 | TEAM TOTAL: 18 PRs | AVG / MEMBER: 4 PRs

---

### M1 — Min. 4 PRs — Project Lead / Full-Stack Developer

**EXPECTED OUTPUTS**

- GitHub repo created with branching strategy (main/dev/feature/*) documented in README
- Vite + React 18 + Tailwind CSS scaffolded and running locally
- Supabase JS client initialized; .env.example committed to repo
- React Router v6 with ProtectedRoute blocking unauthenticated access
- All placeholder pages wired: /customers, /sales, /products, /admin, /deleted-customers, /auth/callback
- dev and main branches protected in GitHub — no direct pushes, PRs required

**PULL REQUESTS**

- PR-01 `feat/project-scaffold` — Vite + React + Tailwind initial setup
- PR-02 `feat/supabase-client` — Supabase JS client init + .env config
- PR-03 `feat/routing-skeleton` — All CMS routes, ProtectedRoute, placeholder pages
- PR-04 `chore/github-protection` — Branch protection rules + PR template

---

### M2 — Min. 4 PRs — Frontend Developer (UI/UX)

**EXPECTED OUTPUTS**

- Login page: email/password form + 'Sign in with Google' button, form validation, clear error messages
- Register page: First Name, Last Name, Username, Email, Password fields + Google register button
- App shell layout: Navbar (user display + logout); Sidebar with CMS links (Customers, Sales, Products, Admin, Deleted Customers — visibility logic in Sprint 2)
- /auth/callback page with loading spinner during OAuth session exchange
- All pages responsive across mobile and desktop

**PULL REQUESTS**

- PR-01 `feat/ui-login-page` — Login form with email + Google OAuth button
- PR-02 `feat/ui-register-page` — Registration form with validation
- PR-03 `feat/ui-app-shell` — Navbar, CMS sidebar, layout wrapper
- PR-04 `feat/ui-auth-callback` — /auth/callback loading page

---

### M3 — Min. 4 PRs — Backend / Database Engineer

**EXPECTED OUTPUTS**

- Supabase project created; URL and anon key shared via .env.example
- All 5 HopeDB tables seeded: customer (82 rows), sales (124 rows), salesDetail (~250 rows), product (52 rows), priceHist (~70 rows)
- Rights Scripts executed: user, Module, user_module, rights, UserModule_Rights tables seeded
- record_status (DEFAULT 'ACTIVE') and stamp columns added to customer table ONLY — other tables unchanged
- 4 modules seeded: Cust_Mod, Sales_Mod, Prod_Mod, Adm_Mod
- 9 rights seeded: CUST_VIEW/ADD/EDIT/DEL, SALES_VIEW, SD_VIEW, PROD_VIEW, PRICE_VIEW, ADM_USER
- SUPERADMIN seeded: jcesperanza@neu.edu.ph, all 9 rights = 1
- All SQL committed to /db/migrations; ERD committed to /docs

**PULL REQUESTS**

- PR-01 `db/initial-schema` — HopeDB 5 tables + record_status/stamp on customer only
- PR-02 `db/rights-seed` — 4 modules + 9 rights + SUPERADMIN seed
- PR-03 `docs/db-erd` — ERD diagram showing 5 table relationships
- PR-04 `db/verify-seed` — SQL verification queries (row counts, FK checks)

---

### M4 — Min. 4 PRs — Rights & Authentication Specialist

**EXPECTED OUTPUTS**

- AuthContext.jsx: wraps app, provides currentUser state via onAuthStateChange
- Email/password: supabase.auth.signUp() + signIn() wired to Register and Login forms
- Google OAuth: supabase.auth.signInWithOAuth({provider:'google'}) wired to Google buttons
- /auth/callback route: processes OAuth redirect, runs login guard, navigates to /customers or /login?error
- Login guard: checks record_status = 'ACTIVE' on every SIGNED_IN event; signs out + error if INACTIVE
- provision_new_user() trigger: fires on auth.users INSERT; creates USER/INACTIVE row; inserts 4 module rows; inserts 9 rights rows (CUST_VIEW=1, SALES_VIEW=1, SD_VIEW=1, PROD_VIEW=1, PRICE_VIEW=1; all add/edit/del/admin rights=0)
- Google OAuth configured in Google Cloud Console + Supabase Dashboard; redirect URLs for localhost + production

**PULL REQUESTS**

- PR-01 `feat/auth-context` — AuthContext, session listener, currentUser state
- PR-02 `feat/auth-email` — signUp() + signIn() wired to Login/Register forms
- PR-03 `feat/auth-google` — signInWithOAuth + /auth/callback + redirect URLs
- PR-04 `db/trigger-provision-user` — provision_new_user() trigger with CMS rights defaults

---

### M5 — Min. 2 PRs — QA / Documentation Specialist

**EXPECTED OUTPUTS**

- Vitest + React Testing Library installed and configured
- Test cases written and executed: email registration, Google OAuth new user flow, login guard blocks INACTIVE, login guard allows ACTIVE
- Sprint 1 log completed: dates, tasks done, blockers, resolutions, next sprint goals
- README.md updated: clone, npm install, .env setup, npm run dev, Supabase project URL

**PULL REQUESTS**

- PR-01 `test/sprint1-auth-flows` — Email + Google OAuth + login guard test cases
- PR-02 `docs/sprint1-log-readme` — Sprint 1 log + README instructions

> **INFO** Sprint 1 Gate: All 5 tables must be seeded with correct row counts AND the login guard must work for both email and Google auth before Sprint 2 begins.

---

## 4. Sprint 2 — Weeks 3 & 4

**Theme:** Customer CRUD (rights-gated), sales & product view-only pages, soft-delete visibility, stamp gating.

> **SPRINT 2** — Customer CRUD, Sales Views & Rights Enforcement | Weeks 3 – 4 | TEAM TOTAL: 18 PRs | AVG / MEMBER: 4 PRs

---

### M1 — Min. 4 PRs — Project Lead / Full-Stack Developer

**EXPECTED OUTPUTS**

- Customer service: getCustomers(userType), addCustomer(), updateCustomer(), softDeleteCustomer(), recoverCustomer(); getCustomers() filters ACTIVE only when userType='USER'
- Sales service: getSalesByCustomer(custNo), getSalesDetail(transNo) — both read-only, no write operations
- Product service: getProducts(), getPriceHistory(prodCode), getCurrentPrice(prodCode) — all read-only
- UserRightsContext integrated at app root; 9 rights loaded on login
- Route guard: /deleted-customers blocked for USER type; redirect to /customers
- Error boundary + loading state components added to all data-fetching pages

**PULL REQUESTS**

- PR-01 `feat/customer-api` — getCustomers, addCustomer, updateCustomer, softDelete, recover
- PR-02 `feat/sales-product-api` — Read-only service functions for sales, salesDetail, product, priceHist
- PR-03 `feat/rights-context-integration` — UserRightsContext wired at app root
- PR-04 `feat/route-guard-deleted` — /deleted-customers blocked for USER

---

### M2 — Min. 5 PRs — Frontend Developer (UI/UX)

**EXPECTED OUTPUTS**

- CustomerListPage: table with custno, custname, address, payterm, record_status; stamp column for ADMIN/SUPERADMIN only; INACTIVE rows hidden for USER; search/filter by name or payterm
- AddCustomerModal (CUST_ADD gated): form with custno, custname, address, payterm (dropdown: COD/30D/45D)
- EditCustomerModal (CUST_EDIT gated): pre-filled form for updating customer details
- SoftDeleteConfirmDialog (CUST_DEL gated — SUPERADMIN only): 'Are you sure?' with customer name
- CustomerDetailPage: customer profile + embedded SalesHistoryPanel (list of transactions: transNo, salesDate, empNo); click any transaction row to open SalesDetailModal (line items: product description, quantity, unit price from latest priceHist entry)
- ProductCataloguePage: read-only table of prodCode, description, unit, current price — no add/edit/delete buttons under any circumstance
- DeletedCustomersPage: INACTIVE customers table with custno, custname, stamp, Recover button; ADMIN/SUPERADMIN only; sidebar link hidden for USER

**PULL REQUESTS**

- PR-01 `feat/ui-customer-list` — CustomerListPage with stamp gating + soft-delete filter
- PR-02 `feat/ui-customer-crud` — AddCustomerModal + EditCustomerModal + SoftDeleteConfirmDialog
- PR-03 `feat/ui-customer-detail` — CustomerDetailPage + SalesHistoryPanel + SalesDetailModal
- PR-04 `feat/ui-product-catalogue` — Read-only ProductCataloguePage
- PR-05 `feat/ui-deleted-customers` — DeletedCustomersPage + sidebar link gating

---

### M3 — Min. 4 PRs — Backend / Database Engineer

**EXPECTED OUTPUTS**

- RLS on customer — SELECT: USER sees ACTIVE only, ADMIN/SUPERADMIN see all rows
- RLS on customer — INSERT (CUST_ADD=1), UPDATE-edit (CUST_EDIT=1), UPDATE record_status to INACTIVE (CUST_DEL=1), UPDATE record_status to ACTIVE — recovery (ADMIN/SUPERADMIN)
- RLS on sales, salesDetail, product, priceHist: SELECT only for all authenticated users — NO INSERT, UPDATE, or DELETE policies created for any of these tables
- SQL view product_current_price: latest priceHist entry per product
- SQL view customer_sales_summary: total transactions + total spend per customer using JOIN across all 5 tables
- All RLS policies tested in Supabase SQL editor using role impersonation for SUPERADMIN, ADMIN, and USER

**PULL REQUESTS**

- PR-01 `db/rls-customer` — SELECT visibility + INSERT + UPDATE (edit + deactivate + recover) policies
- PR-02 `db/rls-view-only-tables` — SELECT-only RLS for sales, salesDetail, product, priceHist (confirmation that no write policies exist)
- PR-03 `db/view-product-current-price` — product_current_price SQL view
- PR-04 `db/view-customer-sales-summary` — customer_sales_summary SQL view

---

### M4 — Min. 3 PRs — Rights & Authentication Specialist

**EXPECTED OUTPUTS**

- UserRightsContext.jsx: on login, queries all 9 UserModule_Rights rows; stores as { CUST_VIEW:1, CUST_ADD:1, CUST_DEL:0, SALES_VIEW:1, ... }
- useRights() hook: exposes rights map to any component
- Add Customer button gated: rendered only when rights.CUST_ADD === 1
- Edit Customer button gated: rendered only when rights.CUST_EDIT === 1
- Delete Customer button gated: rendered only when rights.CUST_DEL === 1 (SUPERADMIN only in practice)
- Stamp column gated: rendered only when currentUser.user_type is ADMIN or SUPERADMIN
- Sidebar Deleted Customers link gated: rendered only when user_type is ADMIN or SUPERADMIN
- Confirmed: Sales, Product, and Price History pages have zero conditional-render checks for add/edit/delete — those buttons simply do not exist in the component markup

**PULL REQUESTS**

- PR-01 `feat/rights-context` — UserRightsContext + useRights hook (9 rights)
- PR-02 `feat/rights-customer-gating` — Add/Edit/Delete button gating + stamp column visibility
- PR-03 `feat/rights-sidebar-nav` — Sidebar link gating for Deleted Customers and Admin

---

### M5 — Min. 2 PRs — QA / Documentation Specialist

**EXPECTED OUTPUTS**

- Rights test matrix: 3 user types × 9 rights = 27 test cases, all documented with pass/fail
- View-only enforcement test: log in as all 3 user types — confirm Sales, SalesDetail, Product, and PriceHistory pages render zero add/edit/delete buttons; confirm no Supabase write calls exist for these tables
- Soft-delete visibility test: soft-delete customer C0001 as SUPERADMIN → confirm it disappears from USER's list; confirm ADMIN sees it in Deleted Customers panel
- Recovery test: ADMIN recovers C0001 → confirm it reappears in all views
- API bypass test: USER calls getCustomers() without ACTIVE filter — confirm RLS blocks INACTIVE rows
- Stamp visibility test: log in as USER — stamp column absent; log in as ADMIN — stamp column present
- Sprint 2 log completed

**PULL REQUESTS**

- PR-01 `test/sprint2-rights-27-cases` — Full 27-case rights test matrix
- PR-02 `test/sprint2-viewonly-softdelete` — View-only enforcement + soft-delete + recovery + bypass tests

> **INFO** Sprint 2 Gate: All 27 rights cases must pass. The view-only enforcement test (zero mutation buttons on sales/product pages for ALL 3 user types) must be explicitly verified and signed off before Sprint 3 begins.

---

## 5. Sprint 3 — Weeks 5 & 6

**Theme:** Admin module, CMS reports, SUPERADMIN protection, production deployment, final documentation.

> **SPRINT 3** — Admin Module, CMS Reports, Deployment & Documentation | Weeks 5 – 6 | TEAM TOTAL: 15 PRs | AVG / MEMBER: 3 PRs

---

### M1 — Min. 3 PRs — Project Lead / Full-Stack Developer

**EXPECTED OUTPUTS**

- Admin Module API: getUsers(), activateUser(userId), deactivateUser(userId) — all block SUPERADMIN rows
- CMS Reports API: getCustomerSalesSummary() from customer_sales_summary view; getTopCustomers() (top 10 by totalSpend); getProductRevenue() from product_revenue view
- App deployed to Vercel or Netlify: production Supabase URL and anon key set as env vars; production /auth/callback URL added to Supabase Redirect URLs
- Release PR created: dev → main, all 5 members review, final merge
- Stale feature branches cleaned up from GitHub

**PULL REQUESTS**

- PR-01 `feat/admin-api` — getUsers + activateUser + deactivateUser (SUPERADMIN-blocked)
- PR-02 `feat/reports-api` — Customer sales summary + top customers + product revenue
- PR-03 `chore/production-deploy` — Vercel/Netlify config + production env vars + redirect URLs

---

### M2 — Min. 3 PRs — Frontend Developer (UI/UX)

**EXPECTED OUTPUTS**

- UserManagementPage: table of all users (userId, username, user_type, record_status); Activate and Deactivate buttons per row; SUPERADMIN rows fully disabled with tooltip 'SUPERADMIN accounts cannot be modified'
- CustomerSalesSummaryPage: sortable table with customer name, transaction count, total spend (formatted as currency), last sale date — searchable by customer name
- TopCustomersPage: ranked bar chart or leaderboard of top 10 customers by total spend, linked to CustomerDetailPage
- ProductRevenuePage: table of product description, total qty sold, total revenue — read-only, no actions
- Final UI polish across all pages: loading skeletons, empty state messages ('No customers found', 'No sales recorded'), error toasts, fully mobile responsive

**PULL REQUESTS**

- PR-01 `feat/ui-admin-users` — UserManagementPage with SUPERADMIN row protection
- PR-02 `feat/ui-reports` — CustomerSalesSummaryPage + TopCustomersPage + ProductRevenuePage
- PR-03 `fix/ui-final-polish` — Loading states, empty states, error handling, mobile fixes

---

### M3 — Min. 3 PRs — Backend / Database Engineer

**EXPECTED OUTPUTS**

- SQL view product_revenue: SUM(quantity × current unitPrice) per product across all salesDetail rows, using latest priceHist price
- RLS on user table for Admin Module: ADMIN can UPDATE record_status only WHERE target user_type != 'SUPERADMIN'; ADMIN cannot UPDATE user_type or any column on SUPERADMIN rows
- RLS on UserModule_Rights: ADMIN cannot INSERT, UPDATE, or DELETE rows where userid belongs to a SUPERADMIN
- Final RLS audit across all tables: customer (5 policies), sales/salesDetail/product/priceHist (SELECT-only confirmed), user + UserModule_Rights (SUPERADMIN guard confirmed)
- Hard delete audit: grep confirms no DELETE statements in any Supabase function, trigger, or migration file
- Database backup verified in Supabase Dashboard

**PULL REQUESTS**

- PR-01 `db/view-product-revenue` — product_revenue SQL view
- PR-02 `db/rls-admin-module` — User table + UserModule_Rights RLS with SUPERADMIN guard
- PR-03 `docs/final-rls-audit` — Audit checklist confirming all RLS and no hard deletes

---

### M4 — Min. 3 PRs — Rights & Authentication Specialist

**EXPECTED OUTPUTS**

- Admin Module sidebar link gated: visible only when rights.ADM_USER === 1
- UserManagementPage: all action buttons (Activate, Deactivate) disabled and greyed out on SUPERADMIN rows; tooltip on hover: 'SUPERADMIN accounts cannot be modified'
- End-to-end rights regression in production: log in as USER, ADMIN, and SUPERADMIN — verify all 9 rights, all button states, all page access restrictions in the live app
- Google OAuth tested in production environment with a real Google account
- SUPERADMIN protection test at DB level: ADMIN sends direct Supabase UPDATE on SUPERADMIN user record — confirm RLS rejects the operation

**PULL REQUESTS**

- PR-01 `feat/rights-admin-module` — ADM_USER sidebar gating
- PR-02 `feat/rights-superadmin-guard` — SUPERADMIN row disabling in UserManagementPage
- PR-03 `test/e2e-rights-production` — Production regression test log (all 3 user types)

---

### M5 — Min. 3 PRs — QA / Documentation Specialist

**EXPECTED OUTPUTS**

- Full end-to-end test in production: all 3 user types, customer CRUD, sales drill-down (transaction → line items → product + price), all 3 reports, admin activation flow — pass/fail with screenshots
- SUPERADMIN protection test: ADMIN attempts to click Activate/Deactivate on SUPERADMIN row — buttons disabled; direct API call — RLS blocks
- View-only confirmation in production: verify Sales, Products, and Price History pages have no mutation controls in the live build for any user type
- User Manual finalized: covers registration (email + Google), login, customer management, sales history navigation (customer → transaction → line items), product catalogue, reports, admin activation — all screenshots from live app
- This Sprint Deliverables document reviewed and finalized
- 12-slide presentation: system overview, table relationships, rights matrix, CRUD demo, sales drill-down demo, reports, architecture, lessons learned

**PULL REQUESTS**

- PR-01 `test/sprint3-e2e-production` — Full production test report with screenshots
- PR-02 `docs/user-manual-final` — Finalized CMS User Manual
- PR-03 `docs/presentation-slides` — 12-slide presentation deck

> **INFO** Sprint 3 Gate (Project Complete): Live URL works, all 3 user types log in via email and Google, view-only tables confirmed mutation-free in production, soft-delete visible only to ADMIN+, SUPERADMIN protection at UI + DB confirmed, no hard deletes found, all docs submitted.

---

## 6. Branch & PR Naming Convention

| Prefix | When to Use | Example |
|---|---|---|
| feat/ | New feature (UI, API, context, view) | feat/customer-soft-delete, feat/sales-history-panel |
| fix/ | Bug fix | fix/cust-visibility-rls, fix/sales-detail-join |
| db/ | Database change (schema, RLS, view, trigger) | db/rls-customer-select, db/view-customer-sales-summary |
| test/ | Test files | test/rights-27-cases, test/softdelete-visibility |
| docs/ | Documentation | docs/user-manual-draft, docs/sprint2-log |
| refactor/ | Code cleanup — no behavior change | refactor/customerService-cleanup |
| chore/ | Config, tooling, deployment | chore/vercel-deploy, chore/supabase-env |

> **NOTE** CMS-specific tip: include the table name in db/ branch names when possible — db/rls-customer-select, db/view-customer-sales-summary. This makes the migration history easy to read and trace.

---

## 7. Git Workflow & PR Checklist

### 7.1 Git Flow

```
dev (stable base — all feature branches fork from here)
|
+──► feat/customer-soft-delete (M1 or M3)
|    └──► PR → reviewed → merged into dev
|
+──► db/rls-view-only-tables (M3)
|    └──► PR → reviewed → merged into dev
|
+──► feat/ui-customer-detail (M2)
|    └──► PR → reviewed → merged into dev
|
+──► test/sprint2-viewonly-softdelete (M5)
     └──► PR → reviewed → merged into dev

[end of sprint]
+──► release/sprint-N (M1 creates from dev)
     └──► PR to main → all 5 members review → merged
```

### 7.2 PR Checklist

- Branch forked from dev — never from main or another feature branch
- Branch name follows convention: feat/, fix/, db/, test/, docs/, refactor/, chore/
- PR title is imperative mood and specific: 'Add SELECT-only RLS for sales and salesDetail tables'
- PR description states: What changed / Why / How to test
- All Vitest tests pass locally before requesting review
- No console.log statements remaining in production code
- No .env files or Supabase keys committed
- At least one team member has reviewed and approved
- Merge target is dev — never main
- Feature branch deleted from GitHub after merge

---

*— End of Document —*
