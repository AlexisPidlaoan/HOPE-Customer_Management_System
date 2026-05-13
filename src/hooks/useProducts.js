import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export function useProducts() {
  const { session } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    supabase
      .from('product_current_price')
      .select('*')
      .order('description')
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, [session]);

  return { products, loading };
}
