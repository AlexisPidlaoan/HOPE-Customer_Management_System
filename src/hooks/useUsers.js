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
    // Step 1: Activate the profile
    const { error } = await supabase
      .from('profiles')
      .update({ record_status: 'ACTIVE' })
      .eq('id', id);

    if (error) return { error };

    // Step 2: Look up the user's type to seed correct rights per the Rights Matrix (§3.2)
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', id)
      .single();

    const userType = profile?.user_type;

    // Rights per matrix:
    //   USER  → VIEW_CUSTOMERS(1), VIEW_SALES(5), VIEW_PRODUCTS(6)
    //   ADMIN → above + ADD_CUSTOMER(2), EDIT_CUSTOMER(3), MANAGE_USERS(7), VIEW_REPORTS(8)
    //           NOTE: DELETE_CUSTOMER(4) and RECOVER_CUSTOMER(9) are SUPERADMIN-only
    //   SUPERADMIN → bypassed entirely via useRights.js (hasRight always returns true)
    const baseRights = [1, 5, 6];
    const adminRights = [2, 3, 7, 8];
    const rightIds = userType === 'ADMIN'
      ? [...baseRights, ...adminRights]
      : baseRights;

    if (userType !== 'SUPERADMIN') {
      const inserts = rightIds.map((right_id) => ({ user_id: id, right_id }));
      await supabase
        .from('user_module_rights')
        .upsert(inserts, { onConflict: 'user_id,right_id' });
    }

    await fetch();
    return { error: null };
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
