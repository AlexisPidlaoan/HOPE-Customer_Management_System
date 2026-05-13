import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

/**
 * Date range helper.
 * Returns { start, end } ISO strings, or { start: null, end: null } for "all time".
 */
export function buildDateRange(preset, customStart, customEnd) {
  if (preset === 'all') return { start: null, end: null };

  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (preset === '7d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  if (preset === '30d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  // custom
  const s = customStart ? new Date(customStart) : new Date(now.setDate(now.getDate() - 29));
  s.setHours(0, 0, 0, 0);
  return { start: s.toISOString(), end: end.toISOString() };
}

/**
 * Main hook for the USER Dashboard.
 */
export function useUserDashboard({ preset = 'all', customStart = '', customEnd = '' } = {}) {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const fetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const errs = [];

    try {
      const { start, end } = buildDateRange(preset, customStart, customEnd);

      // Sales query — date filtered only when a range is active
      let salesQuery = supabase
        .from('sales')
        .select('transno, salesdate, custno, empno, customer(custname)')
        .order('salesdate', { ascending: false });
      if (start) salesQuery = salesQuery.gte('salesdate', start);
      if (end)   salesQuery = salesQuery.lte('salesdate', end);

      const [
        { data: customers, error: custErr },
        { data: sales, error: salesErr },
        { data: salesDetail, error: sdErr },
      ] = await Promise.all([
        supabase
          .from('customer')
          .select('custno, custname, address, payterm, record_status, stamp')
          .eq('record_status', 'ACTIVE')
          .order('custname'),
        salesQuery,
        supabase
          .from('salesdetail')
          .select('transno, prodcode, quantity, product_current_price(current_price)'),
      ]);

      if (custErr) errs.push('Could not load customer data.');
      if (salesErr) errs.push('Could not load sales data.');
      if (sdErr) errs.push('Could not load sales detail data.');

      // ── KPI Calculations ──────────────────────────────────────────────────
      const activeCustomers = (customers || []).length;
      const totalTransactions = (sales || []).length;

      // Build transno → amount lookup from all salesdetail
      const transAmountMap = {};
      (salesDetail || []).forEach((sd) => {
        const price = sd.product_current_price?.current_price || 0;
        transAmountMap[sd.transno] = (transAmountMap[sd.transno] || 0) + (sd.quantity * price);
      });

      const inRangeTransNos = new Set((sales || []).map((s) => s.transno));
      const totalSalesAmount = [...inRangeTransNos].reduce(
        (sum, t) => sum + (transAmountMap[t] || 0), 0
      );

      const prodsInRange = new Set(
        (salesDetail || [])
          .filter((sd) => inRangeTransNos.has(sd.transno))
          .map((sd) => sd.prodcode)
      );
      const uniqueProductsSold = prodsInRange.size;

      // ── Sales Trend (monthly for "all", daily otherwise) ──────────────────
      const salesByDay = {};
      (sales || []).forEach((s) => {
        // For "all time" bucket by month (YYYY-MM), otherwise by day (YYYY-MM-DD)
        const key = preset === 'all'
          ? s.salesdate?.slice(0, 7)   // monthly
          : s.salesdate?.slice(0, 10); // daily
        if (key) {
          if (!salesByDay[key]) salesByDay[key] = { count: 0, amount: 0 };
          salesByDay[key].count += 1;
          salesByDay[key].amount += transAmountMap[s.transno] || 0;
        }
      });

      let trendLabels = [];
      let trendValues = [];
      let trendAmounts = [];

      if (preset === 'all') {
        // Use all unique months from the data, sorted
        const months = Object.keys(salesByDay).sort();
        months.forEach((m) => {
          const [y, mo] = m.split('-');
          trendLabels.push(new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }));
          trendValues.push(salesByDay[m].count);
          trendAmounts.push(salesByDay[m].amount);
        });
      } else {
        // Fill every day in the range
        const startDate = new Date(start);
        const endDate = new Date(end);
        const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        for (let i = 0; i < dayCount; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          trendLabels.push(d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));
          trendValues.push(salesByDay[key]?.count || 0);
          trendAmounts.push(salesByDay[key]?.amount || 0);
        }
      }

      // ── Recent Transactions (top 20, enriched with amount) ────────────────
      const recentTransactions = (sales || []).slice(0, 20).map((s) => ({
        ...s,
        amount: transAmountMap[s.transno] || 0,
      }));

      // ── Customers panel (top 8 alphabetical) ──────────────────────────────
      const newCustomers = (customers || []).slice(0, 8);

      setErrors(errs);
      setData({
        kpi: { activeCustomers, totalTransactions, totalSalesAmount, uniqueProductsSold },
        trend: { labels: trendLabels, counts: trendValues, amounts: trendAmounts },
        recentTransactions,
        newCustomers,
      });
    } catch (err) {
      console.error('UserDashboard fetch error:', err);
      errs.push('Unexpected error loading dashboard. Please refresh.');
      setErrors(errs);
    } finally {
      setLoading(false);
    }
  }, [session, preset, customStart, customEnd]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, errors, refetch: fetch };
}
