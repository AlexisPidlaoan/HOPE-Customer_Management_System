import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

export function useSales({ custno } = {}) {
  const { session } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('sales')
      .select('*, customer(custname)')
      .order('salesdate', { ascending: false });
    if (custno) q = q.eq('custno', custno);
    const { data } = await q;
    setSales(data || []);
    setLoading(false);
  }, [custno]);

  useEffect(() => { 
    if (session) fetch(); 
  }, [fetch, session]);

  return { sales, loading, refetch: fetch };
}

export function useSaleDetail(transno) {
  const [detail, setDetail] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transno) return;
    Promise.all([
      supabase.from('sales').select('*, customer(custname, payterm)').eq('transno', transno).single(),
      supabase.from('salesdetail').select('*, product_current_price(description, unit, current_price)').eq('transno', transno),
    ]).then(([{ data: hdr }, { data: lines }]) => {
      setDetail(hdr);
      setItems(lines || []);
      setLoading(false);
    });
  }, [transno]);

  return { detail, items, loading };
}
