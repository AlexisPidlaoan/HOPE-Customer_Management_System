# Sprint 3 — E2E Production Test Report
**Tester:** M5 — QA / Documentation Specialist
**Date:** [date you tested]
**Live URL:** [your deployed app URL]

---

## 1. Customer CRUD

| Test Case | User Type | Expected Result | Result | Screenshot |
|-----------|-----------|-----------------|--------|------------|
| View customer list | USER | Sees active customers only | PASS | ![](screenshots/customer-list-user.png) |
| View customer list | ADMIN | Sees all customers, Add and Edit buttons visible | PASS/FAIL | |
| View customer list | SUPERADMIN | Sees all customers, all buttons visible | PASS/FAIL | |
| Add customer | ADMIN | Can successfully add a new customer | PASS/FAIL | |
| Edit customer | ADMIN | Can successfully edit a customer | PASS/FAIL | |
| Soft-delete customer | SUPERADMIN | Customer disappears from USER view | PASS/FAIL | |
| View deleted customers | ADMIN | Sees INACTIVE customers in Deleted Customers page | PASS/FAIL | |
| Recover customer | ADMIN | Customer reappears in all views after recovery | PASS/FAIL | |

---

## 2. Sales Drill-Down

| Test Case | User Type | Expected Result | Result | Screenshot |
|-----------|-----------|-----------------|--------|------------|
| Click customer → see transactions | USER | transNo, salesDate, empNo listed | PASS/FAIL | |
| Click transaction → see line items | USER | Product description, qty, unit price shown | PASS/FAIL | |
| Price shown is latest priceHist entry | USER | Correct current price displayed | PASS/FAIL | |

---

## 3. Reports

| Test Case | User Type | Expected Result | Result | Screenshot |
|-----------|-----------|-----------------|--------|------------|
| Customer Sales Summary loads | SUPERADMIN | Table loads with correct data | PASS/FAIL | |
| Top Customers loads | SUPERADMIN | Top 10 customers shown | PASS/FAIL | |
| Product Revenue loads | SUPERADMIN | Table loads with correct data | PASS/FAIL | |

---

## 4. Admin Activation

| Test Case | User Type | Expected Result | Result | Screenshot |
|-----------|-----------|-----------------|--------|------------|
| Activate a USER account | ADMIN | Account status changes to ACTIVE | PASS/FAIL | |
| Deactivate a USER account | ADMIN | Account status changes to INACTIVE | PASS/FAIL | |
| SUPERADMIN row buttons | ADMIN | Buttons are greyed out / disabled | PASS/FAIL | |
| Tooltip on SUPERADMIN row | ADMIN | Shows "SUPERADMIN accounts cannot be modified" | PASS/FAIL | |

---

## 5. SUPERADMIN Protection Test

| Test Case | Expected Result | Result | Screenshot |
|-----------|-----------------|--------|------------|
| ADMIN clicks Activate on SUPERADMIN row | Button is disabled, no action | PASS/FAIL | |
| ADMIN tries direct API call on SUPERADMIN | RLS blocks the operation | PASS/FAIL | |

---

## 6. View-Only Confirmation

| Page | User Type | Expected Result | Result | Screenshot |
|------|-----------|-----------------|--------|------------|
| Sales page | USER | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Sales page | ADMIN | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Sales page | SUPERADMIN | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Products page | USER | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Products page | ADMIN | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Products page | SUPERADMIN | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Price History page | USER | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Price History page | ADMIN | Zero Add/Edit/Delete buttons | PASS/FAIL | |
| Price History page | SUPERADMIN | Zero Add/Edit/Delete buttons | PASS/FAIL | |

---

## 7. Summary

| Category | Total Tests | Passed | Failed |
|----------|-------------|--------|--------|
| Customer CRUD | 8 | | |
| Sales Drill-Down | 3 | | |
| Reports | 3 | | |
| Admin Activation | 4 | | |
| SUPERADMIN Protection | 2 | | |
| View-Only Confirmation | 9 | | |
| **TOTAL** | **29** | | |

---

## 8. Notes / Issues Found
- [Write any bugs or issues you found here]
