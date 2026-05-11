import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

/**
 * Fetches aggregated dashboard data for the SUPERADMIN dashboard.
 * All queries run against real Supabase tables.
 */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          { data: customers },
          { data: sales },
          { data: salesDetail },
          { data: products },
          { data: profiles },
          { data: pricehist },
        ] = await Promise.all([
          supabase.from('customer').select('*'),
          supabase.from('sales').select('*'),
          supabase.from('salesdetail').select('*, product_current_price(current_price)'),
          supabase.from('product').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('pricehist').select('*'),
        ]);

        // === KPI Calculations ===
        const activeCustomers = (customers || []).filter(c => c.record_status === 'ACTIVE').length;
        const inactiveCustomers = (customers || []).filter(c => c.record_status === 'INACTIVE').length;
        const totalTransactions = (sales || []).length;
        const totalProducts = (products || []).length;
        const totalUsers = (profiles || []).length;
        const activeUsers = (profiles || []).filter(p => p.record_status === 'ACTIVE').length;

        // Revenue calculation
        const totalRevenue = (salesDetail || []).reduce((sum, sd) => {
          const price = sd.product_current_price?.current_price || 0;
          return sum + (sd.quantity * price);
        }, 0);

        // Average order value
        const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        // === Monthly Sales Chart Data ===
        const monthlyMap = {};
        (sales || []).forEach(s => {
          const d = new Date(s.salesdate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyMap[key] = (monthlyMap[key] || 0) + 1;
        });
        const sortedMonths = Object.keys(monthlyMap).sort();
        const last12Months = sortedMonths.slice(-12);
        const monthlySales = {
          labels: last12Months.map(m => {
            const [y, mo] = m.split('-');
            return new Date(y, mo - 1).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' });
          }),
          values: last12Months.map(m => monthlyMap[m]),
        };

        // === Monthly Revenue Chart Data ===
        const revenueByMonth = {};
        (sales || []).forEach(s => {
          const d = new Date(s.salesdate);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!revenueByMonth[key]) revenueByMonth[key] = 0;
        });
        // Match sales detail to sales to get date
        const salesDateMap = {};
        (sales || []).forEach(s => { salesDateMap[s.transno] = s.salesdate; });
        (salesDetail || []).forEach(sd => {
          const saleDate = salesDateMap[sd.transno];
          if (saleDate) {
            const d = new Date(saleDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const price = sd.product_current_price?.current_price || 0;
            revenueByMonth[key] = (revenueByMonth[key] || 0) + (sd.quantity * price);
          }
        });
        const monthlyRevenue = {
          labels: last12Months.map(m => {
            const [y, mo] = m.split('-');
            return new Date(y, mo - 1).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' });
          }),
          values: last12Months.map(m => revenueByMonth[m] || 0),
        };

        // === Customer Pay Term Breakdown (Pie chart) ===
        const payTermMap = {};
        (customers || []).filter(c => c.record_status === 'ACTIVE').forEach(c => {
          payTermMap[c.payterm] = (payTermMap[c.payterm] || 0) + 1;
        });
        const payTermBreakdown = {
          labels: Object.keys(payTermMap).map(k => {
            const names = { COD: 'Cash on Delivery', '30D': '30 Days', '45D': '45 Days' };
            return names[k] || k;
          }),
          values: Object.values(payTermMap),
        };

        // === Top 5 Products by Revenue ===
        const productRevMap = {};
        (salesDetail || []).forEach(sd => {
          const price = sd.product_current_price?.current_price || 0;
          const rev = sd.quantity * price;
          productRevMap[sd.prodcode] = (productRevMap[sd.prodcode] || 0) + rev;
        });
        const productNameMap = {};
        (products || []).forEach(p => { productNameMap[p.prodcode] = p.description; });
        const topProducts = Object.entries(productRevMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([code, rev]) => ({ code, name: productNameMap[code] || code, revenue: rev }));

        // === Top 5 Customers by Transactions ===
        const custTxMap = {};
        (sales || []).forEach(s => {
          custTxMap[s.custno] = (custTxMap[s.custno] || 0) + 1;
        });
        const custNameMap = {};
        (customers || []).forEach(c => { custNameMap[c.custno] = c.custname; });
        const topCustomers = Object.entries(custTxMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([custno, count]) => ({ custno, name: custNameMap[custno] || custno, transactions: count }));

        // === User Type Breakdown ===
        const userTypeMap = {};
        (profiles || []).forEach(p => {
          userTypeMap[p.user_type] = (userTypeMap[p.user_type] || 0) + 1;
        });

        setData({
          kpi: {
            activeCustomers,
            inactiveCustomers,
            totalTransactions,
            totalRevenue,
            avgOrderValue,
            totalProducts,
            totalUsers,
            activeUsers,
          },
          monthlySales,
          monthlyRevenue,
          payTermBreakdown,
          topProducts,
          topCustomers,
          userTypeMap,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { data, loading };
}
