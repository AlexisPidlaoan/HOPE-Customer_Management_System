import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export function useRights() {
  const { profile } = useAuth();
  const [rights, setRights] = useState([]);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('user_module_rights')
      .select('rights(right_name)')
      .eq('user_id', profile.id)
      .then(({ data }) => {
        if (data) setRights(data.map((r) => r.rights?.right_name).filter(Boolean));
      });
  }, [profile?.id]);

  const hasRight = (name) => {
    if (profile?.user_type === 'SUPERADMIN') return true;
    return rights.includes(name);
  };

  return { rights, hasRight };
}
