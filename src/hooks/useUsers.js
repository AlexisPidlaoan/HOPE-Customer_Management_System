import { supabase } from '../lib/supabase';
import { useState, useEffect, useCallback } from 'react';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const activateUser = async (id) => {
    const { error } = await supabase
      .from('profiles')
      .update({ record_status: 'ACTIVE' })
      .eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const deactivateUser = async (id) => {
    const { error } = await supabase
      .from('profiles')
      .update({ record_status: 'INACTIVE' })
      .eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { users, loading, refetch: fetch, activateUser, deactivateUser };
}
