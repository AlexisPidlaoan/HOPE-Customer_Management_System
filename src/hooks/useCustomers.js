import { supabase } from '../lib/supabase';
import { useState, useEffect, useCallback } from 'react';

function makeStamp(action, email) {
  const now = new Date().toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' });
  return `${action} by ${email || 'system'} on ${now}`;
}

export function useCustomers({ includeInactive = false } = {}) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('customer').select('*').order('custname');
    if (!includeInactive) q = q.eq('record_status', 'ACTIVE');
    const { data, error } = await q;
    setCustomers(data || []);
    setError(error);
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => { fetch(); }, [fetch]);

  const addCustomer = async (payload) => {
    const { error } = await supabase.from('customer').insert([payload]);
    if (!error) await fetch();
    return { error };
  };

  const editCustomer = async (custno, payload) => {
    const { error } = await supabase.from('customer').update(payload).eq('custno', custno);
    if (!error) await fetch();
    return { error };
  };

  // Core Rule 2: soft-delete only — sets record_status to INACTIVE + updates stamp
  const softDeleteCustomer = async (custno, userEmail) => {
    const { error } = await supabase
      .from('customer')
      .update({
        record_status: 'INACTIVE',
        stamp: makeStamp('DEACTIVATED', userEmail),
      })
      .eq('custno', custno);
    if (!error) await fetch();
    return { error };
  };

  const recoverCustomer = async (custno, userEmail) => {
    const { error } = await supabase
      .from('customer')
      .update({
        record_status: 'ACTIVE',
        stamp: makeStamp('REACTIVATED', userEmail),
      })
      .eq('custno', custno);
    if (!error) await fetch();
    return { error };
  };

  return { customers, loading, error, refetch: fetch, addCustomer, editCustomer, softDeleteCustomer, recoverCustomer };
}

