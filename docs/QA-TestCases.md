# QA Test Cases

## 🔐 Authentication

### Login Test
- Input valid email/password → Should login successfully
- Input invalid credentials → Should show error message

---

## 🧭 Navigation

- Sidebar links should redirect properly:
  - Dashboard
  - Customers
  - Services
  - Appointments

---

## 📊 Dashboard

- Should display data correctly
- Should show empty state if no data exists

---

## 📁 Data Handling

- Ensure no broken UI when API data is missing
- Ensure fallback images are shown if image_url fails
