import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://soovvcasbdrkfdgzgnbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3Z2Y2FzYmRya2ZkZ3pnbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3OTksImV4cCI6MjA5MTMwMDc5OX0.0wL_7bfjRiXtMsy3xovmSVRWyOi_ja_fm5Fdi7wj8t4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedOrders() {
  console.log('--- Seeding Mock Orders ---');

  // Fetch some products to link to
  const { data: products } = await supabase.from('products').select('*').limit(3);
  if (!products || products.length === 0) {
    console.error('No products found to create orders for!');
    return;
  }

  const mockOrders = [
    {
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+92 300 1234567",
      address: "123 Fashion Ave",
      city: "Karachi",
      state: "Sindh",
      country: "PK",
      zip_code: "75500",
      payment_method: "card",
      subtotal: products[0].price,
      shipping_cost: 0,
      tax: products[0].price * 0.08,
      total: products[0].price * 1.08,
      status: "pending",
    },
    {
      full_name: "Jane Smith",
      email: "jane@example.com",
      phone: "+92 301 7654321",
      address: "456 Style Road",
      city: "Lahore",
      state: "Punjab",
      country: "PK",
      zip_code: "54000",
      payment_method: "cod",
      subtotal: products[1].price,
      shipping_cost: 200,
      tax: products[1].price * 0.08,
      total: products[1].price * 1.08 + 200,
      status: "processing",
    }
  ];

  for (const order of mockOrders) {
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderErr) {
      console.error('Order insert error:', orderErr.message);
      continue;
    }

    console.log(`Created order ${orderData.id}`);

    // Add item
    const { error: itemErr } = await supabase.from('order_items').insert({
      order_id: orderData.id,
      product_id: products[0].id,
      product_name: products[0].name,
      quantity: 1,
      price_at_purchase: products[0].price,
      size: "M",
      color: "Black"
    });

    if (itemErr) console.error('Item insert error:', itemErr.message);
  }

  console.log('--- Seeding Finished ---');
}

seedOrders();
