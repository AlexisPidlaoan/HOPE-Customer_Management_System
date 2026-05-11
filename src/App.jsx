import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider';
import PrivateRoute from './components/guards/PrivateRoute';
import AdminRoute from './components/guards/AdminRoute';
import SuperAdminRoute from './components/guards/SuperAdminRoute';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import SalesListPage from './pages/SalesListPage';
import ProductCataloguePage from './pages/ProductCataloguePage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DeletedCustomersPage from './pages/admin/DeletedCustomersPage';
import CustomerSummaryReport from './pages/admin/reports/CustomerSummaryReport';
import TopCustomersReport from './pages/admin/reports/TopCustomersReport';
import ProductRevenueReport from './pages/admin/reports/ProductRevenueReport';
import DashboardPage from './pages/admin/DashboardPage';
import RbacSettingsPage from './pages/admin/RbacSettingsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected shell */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/customers" replace />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/:custno" element={<CustomerDetailPage />} />
          <Route path="sales" element={<SalesListPage />} />
          <Route path="products" element={<ProductCataloguePage />} />

          {/* Admin routes */}
          <Route path="admin/dashboard" element={<SuperAdminRoute><DashboardPage /></SuperAdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="admin/deleted-customers" element={<AdminRoute><DeletedCustomersPage /></AdminRoute>} />
          <Route path="admin/reports/customer-summary" element={<AdminRoute><CustomerSummaryReport /></AdminRoute>} />
          <Route path="admin/reports/top-customers" element={<AdminRoute><TopCustomersReport /></AdminRoute>} />
          <Route path="admin/reports/product-revenue" element={<AdminRoute><ProductRevenueReport /></AdminRoute>} />
          <Route path="admin/rbac" element={<SuperAdminRoute><RbacSettingsPage /></SuperAdminRoute>} />
          <Route path="admin/audit-logs" element={<SuperAdminRoute><AuditLogsPage /></SuperAdminRoute>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Routes>
    </ToastProvider>
  );
}