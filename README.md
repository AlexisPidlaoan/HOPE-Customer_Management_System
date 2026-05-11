# HOPE, INC. — Customer Management System (HopeCMS)

A full-stack Customer Management System built for Hope, Inc. using **React + Vite + Tailwind CSS** with **Supabase** (PostgreSQL) as the backend. Manages customers with full CRUD, provides read-only views for sales, products, and price history, and enforces role-based access control across three user types.

## Features

- **Customer Management**: View, add, edit, and soft-delete customer records
- **Sales History**: View customer transactions and drill down into sales detail line items
- **Product Catalogue**: Read-only product listing with current prices from price history
- **Reports**: Customer Sales Summary, Top Customers, Product Revenue
- **Admin Module**: User management with activate/deactivate controls
- **Role-Based Access Control**: SUPERADMIN, ADMIN, USER with 9 granular rights
- **Soft Delete**: Customers are deactivated (never hard-deleted), recoverable by ADMIN/SUPERADMIN
- **Audit Logs**: Global activity tracking (SUPERADMIN only)
- **Authentication**: Email/Password + Google OAuth via Supabase Auth

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth 2.0) |
| State | React Context API |
| Deployment | Netlify |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A Supabase project (free tier)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AlexisPidlaoan/HOPE-Customer_Management_System.git
   cd HOPE-Customer_Management_System
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** — copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run database migrations** — execute the SQL files in `supabase/migrations/` in order (001–013) in the Supabase SQL Editor.

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. Open your browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory, ready for Netlify deployment.

## Project Structure

```
src/
├── components/
│   ├── customers/      # AddCustomerModal, EditCustomerModal, SoftDeleteConfirmDialog
│   ├── guards/         # PrivateRoute, AdminRoute, SuperAdminRoute
│   ├── sales/          # SalesDetailModal
│   └── ui/             # Badge, Modal, Spinner, Toast, Tooltip, Skeleton, etc.
├── context/
│   └── AuthContext.jsx  # Global auth session + profile state
├── hooks/
│   ├── useCustomers.js  # Customer CRUD operations
│   ├── useSales.js      # Sales data (read-only)
│   ├── useProducts.js   # Product data (read-only)
│   ├── useRights.js     # User rights from DB
│   ├── useUsers.js      # Admin user management
│   ├── useReports.js    # Report data
│   ├── useDashboard.js  # Dashboard KPIs
│   └── useAuditLogs.js  # Audit log entries
├── lib/
│   ├── supabase.js      # Supabase client init
│   └── formatters.js    # Currency, date, string formatters
├── pages/
│   ├── LoginPage.jsx
│   ├── AuthCallbackPage.jsx
│   ├── CustomerListPage.jsx
│   ├── CustomerDetailPage.jsx
│   ├── SalesListPage.jsx
│   ├── ProductCataloguePage.jsx
│   └── admin/
│       ├── UserManagementPage.jsx
│       ├── DeletedCustomersPage.jsx
│       ├── DashboardPage.jsx
│       ├── AuditLogsPage.jsx
│       ├── RbacSettingsPage.jsx
│       └── reports/
│           ├── CustomerSummaryReport.jsx
│           ├── TopCustomersReport.jsx
│           └── ProductRevenueReport.jsx
├── App.jsx              # Route definitions
└── main.jsx             # Entry point
DB/                       # Standalone SQL scripts (fixes, promotions)
supabase/migrations/      # Ordered SQL migrations (001–013)
delivarables/             # Project guide + sprint deliverables docs
```

## User Roles

| Role | Access |
|---|---|
| **USER** | View active customers, sales, products. Read-only. |
| **ADMIN** | Add/edit customers, manage users, view reports, access deleted customers. |
| **SUPERADMIN** | Full control: soft-delete customers, manage admins, dashboard, audit logs, RBAC. |

## Core Rules

1. **No hard deletes** — `DELETE` keyword never appears in app code. Customer removals use `record_status = 'INACTIVE'`.
2. **INACTIVE customers invisible to USER** — enforced at both RLS and application level.
3. **View-only tables** — sales, salesDetail, product, priceHist have zero add/edit/delete controls.
4. **SUPERADMIN protection** — ADMIN cannot modify SUPERADMIN accounts (UI disabled + RLS guard).

## Database

- **5 core tables**: customer (CRUD), sales, salesDetail, product, priceHist (view-only)
- **3 SQL views**: product_current_price, customer_sales_summary, product_revenue
- **Auth tables**: profiles, modules, rights, user_module_rights
- **RLS**: Row-Level Security on all tables

## Deployment

Configured for **Netlify** via `netlify.toml`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Netlify dashboard.

---

**New Era University — College of Computer Studies**
Academic Year 2025–2026
