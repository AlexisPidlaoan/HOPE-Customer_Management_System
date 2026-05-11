# HopeCMS User Manual
**Version:** 1.0  
**Prepared by:** M5 — QA / Documentation Specialist  
**Date:** May 11, 2026  
**Live URL:** https://hopecms.netlify.app

---

## Table of Contents
1. [Registration](#1-registration)
2. [Login](#2-login)
3. [Customer Management](#3-customer-management)
4. [Sales History Navigation](#4-sales-history-navigation)
5. [Product Catalogue](#5-product-catalogue)
6. [Reports](#6-reports)
7. [Admin Activation](#7-admin-activation)

---

## 1. Registration

1. Go to https://hopecms.netlify.app
2. Click **Register** or **Sign Up**
3. Fill in the following fields:
   - First Name
   - Last Name
   - Username
   - Email
   - Password
4. Click **Submit**
5. Your account will be **INACTIVE** until an Admin activates it

![](screenshots/register-email.png)

---

## 2. Login

1. Go to https://hopecms.netlify.app
2. Enter your **Email** and **Password**
3. Click **Login**
4. If your account is INACTIVE, you will see an error message

![](screenshots/login-email.png)

---

## 3. Customer Management

### Viewing Customers
- All user types can view the customer list
- **USER** — sees active customers only, no action buttons
- **ADMIN** — sees all customers, Add and Edit buttons visible
- **SUPERADMIN** — sees all customers, Edit and Deactivate buttons visible

![](screenshots/customer-list-user.png)

### Adding a Customer *(ADMIN / SUPERADMIN only)*
1. Click the **+ New Customer** button
2. Fill in the following fields:
   - Customer ID
   - Customer Name
   - Address
   - Payment Term
3. Click **+ Add Customer**
4. The new customer appears in the list

![](screenshots/customer-add-admin.png)

### Editing a Customer *(ADMIN / SUPERADMIN only)*
1. Find the customer in the list
2. Click the **Edit** button on their row
3. Update the fields
4. Click **Save Changes**

![](screenshots/customer-edit-admin.png)

### Deactivating a Customer *(SUPERADMIN only)*
1. Find the customer in the list
2. Click the **Deactivate** button on their row
3. The customer becomes inactive and disappears from USER view
4. The customer is NOT permanently deleted and can be recovered

![](screenshots/customer-list-superadmin.png)

### Viewing Deleted Customers *(ADMIN / SUPERADMIN only)*
1. Navigate to the **Deleted Customers** page from the sidebar
2. See all inactive customers
3. Click **Recover** to restore a customer to active status

![](screenshots/customer-deleted-admin.png)

---

## 4. Sales History Navigation

### Viewing a Customer's Transactions
1. Go to the Customer list
2. Click on a **customer's name**
3. You will see their transaction list showing:
   - Transaction No
   - Sales Date
   - Employee No

![](screenshots/sales-transactions-user.png)

### Viewing Transaction Line Items
1. From the transaction list, click on a **transaction**
2. You will see the line items showing:
   - Product Code
   - Product Description
   - Unit
   - Quantity
   - Unit Price *(latest price from Price History)*
   - Subtotal

![](screenshots/sales-lineitems-user.png)

---

## 5. Product Catalogue

- Navigate to the **Products** page from the sidebar
- This page is **view-only** — no Add, Edit, or Delete buttons for any user type
- Displays the following columns:
  - Product Code
  - Description
  - Unit
  - Current Price
  - Price As Of

![](screenshots/products-page-user.png)

---

## 6. Reports

> **Note:** Reports are only available to ADMIN and SUPERADMIN accounts.

### Customer Sales Summary
- Shows aggregated spend and transaction counts per customer
- Displays total customers, total transactions, and total revenue
- Use the search bar to filter by customer name

![](screenshots/report-customer-summary-admin.png)

### Top Customers
- Shows the top 10 customers by total spend
- Displayed as a bar chart and a rankings leaderboard

![](screenshots/report-top-customers-admin.png)

### Product Revenue
- Shows total quantity sold and revenue per product
- Displays total products, units sold, and total revenue
- Includes revenue share percentage per product

![](screenshots/report-product-revenue-admin.png)

---

## 7. Admin Activation

### Activating a User *(ADMIN / SUPERADMIN only)*
1. Navigate to **User Management** from the sidebar
2. Find the user with **INACTIVE** status
3. Click **Activate**
4. Their status changes to **ACTIVE** and they can now log in

![](screenshots/user-management-admin.png)

### Deactivating a User *(ADMIN / SUPERADMIN only)*
1. Navigate to **User Management** from the sidebar
2. Find the user with **ACTIVE** status
3. Click **Deactivate**
4. Their status changes to **INACTIVE**

![](screenshots/user-management-admin.png)

### SUPERADMIN Protection
- The **Activate/Deactivate** buttons are **disabled** on SUPERADMIN rows
- ADMIN accounts cannot modify SUPERADMIN accounts
- This protection is enforced at both the UI and database level

![](screenshots/user-management-admin.png)
