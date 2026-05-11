import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('product_current_price')
      .select('*')
      .order('description')
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}
