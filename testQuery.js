import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: cust, error: errCust } = await supabase.from('customer').select('*');
  console.log('Customers:', cust?.length, 'Error:', errCust);

  const { data: sales, error: errSales } = await supabase.from('sales').select('*');
  console.log('Sales:', sales?.length, 'Error:', errSales);

  const { data: prod, error: errProd } = await supabase.from('product').select('*');
  console.log('Products:', prod?.length, 'Error:', errProd);
}

test();
