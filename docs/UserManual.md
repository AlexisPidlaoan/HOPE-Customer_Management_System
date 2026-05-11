# HopeCMS User Manual
**Version:** 1.0  
**Prepared by:** M5 — QA / Documentation Specialist  
**Date:** [date]  
**Live URL:** [your deployed app URL]

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

### Email Registration
1. Go to the app URL
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

### Google Registration
1. Click **Sign in with Google**
2. Select your Google account
3. You will be redirected to the app
4. Your account will be **INACTIVE** until an Admin activates it

![](screenshots/register-google.png)

---

## 2. Login

### Email Login
1. Go to the app URL
2. Enter your **Email** and **Password**
3. Click **Login**
4. If your account is INACTIVE, you will see an error message

![](screenshots/login-email.png)

### Google Login
1. Click **Sign in with Google**
2. Select your Google account
3. You will be redirected to the dashboard

![](screenshots/login-google.png)

---

## 3. Customer Management

### Viewing Customers
- All user types can view the customer list
- **USER** — sees active customers only, no action buttons
- **ADMIN** — sees all customers, Add and Edit buttons visible
- **SUPERADMIN** — sees all customers, all buttons visible including Delete

![](screenshots/customer-list-user.png)

### Adding a Customer *(ADMIN / SUPERADMIN only)*
1. Click the **Add Customer** button
2. Fill in the customer details
3. Click **Save**
4. The new customer appears in the list

![](screenshots/customer-add.png)

### Editing a Customer *(ADMIN / SUPERADMIN only)*
1. Find the customer in the list
2. Click the **Edit** button on their row
3. Update the fields
4. Click **Save**

![](screenshots/customer-edit.png)

### Soft-Deleting a Customer *(SUPERADMIN only)*
1. Find the customer in the list
2. Click the **Delete** button on their row
3. Confirm the action
4. The customer disappears from USER and ADMIN view but is not permanently deleted

![](screenshots/customer-delete.png)

### Viewing Deleted Customers *(ADMIN / SUPERADMIN only)*
1. Navigate to the **Deleted Customers** page
2. See all INACTIVE customers
3. Click **Recover** to restore a customer

![](screenshots/customer-deleted-list.png)

---

## 4. Sales History Navigation

### Viewing a Customer's Transactions
1. Go to the Customer list
2. Click on a **customer's name**
3. You will see their transaction list showing:
   - Transaction No
   - Sales Date
   - Employee No

![](screenshots/sales-transactions.png)

### Viewing Transaction Line Items
1. From the transaction list, click on a **transaction**
2. You will see the line items showing:
   - Product Description
   - Quantity
   - Unit Price *(latest price from Price History)*

![](screenshots/sales-lineitems.png)

---

## 5. Product Catalogue

- Navigate to the **Products** page
- This page is **view-only** — no Add, Edit, or Delete buttons for any user type
- Displays the following columns:
  - Product Code
  - Description
  - Unit
  - Current Price

![](screenshots/products-page.png)

---

## 6. Reports

### Customer Sales Summary
- Shows a summary of sales per customer
- Use the search bar to filter by customer name
- Columns: Customer Name, Total Sales, Number of Transactions

![](screenshots/report-sales-summary.png)

### Top Customers
- Shows the top 10 customers by total sales
- Displayed as a chart or leaderboard

![](screenshots/report-top-customers.png)

### Product Revenue
- Shows revenue generated per product
- Columns: Product Name, Total Quantity Sold, Total Revenue

![](screenshots/report-product-revenue.png)

---

## 7. Admin Activation

### Activating a User *(ADMIN / SUPERADMIN only)*
1. Navigate to **User Management**
2. Find the user with **INACTIVE** status
3. Click **Activate**
4. Their status changes to **ACTIVE** and they can now log in

![](screenshots/admin-activate.png)

### Deactivating a User *(ADMIN / SUPERADMIN only)*
1. Navigate to **User Management**
2. Find the user with **ACTIVE** status
3. Click **Deactivate**
4. Their status changes to **INACTIVE**

![](screenshots/admin-deactivate.png)

### SUPERADMIN Protection
- The **Activate/Deactivate** buttons are **disabled** on SUPERADMIN rows
- ADMIN accounts cannot modify SUPERADMIN accounts

![](screenshots/admin-superadmin-protected.png)
