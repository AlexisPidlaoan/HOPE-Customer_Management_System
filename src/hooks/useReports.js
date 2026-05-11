import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export function useCustomerSummary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('customer_sales_summary')
      .select('*')
      .order('total_spend', { ascending: false })
      .then(({ data }) => { setData(data || []); setLoading(false); });
  }, []);

  return { data, loading };
}

export function useProductRevenue() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('product_revenue')
      .select('*')
      .order('total_revenue', { ascending: false })
      .then(({ data }) => { setData(data || []); setLoading(false); });
  }, []);

  return { data, loading };
}
