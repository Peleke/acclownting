// Test helpers for Supabase operations
// These can be used for integration tests against a test Supabase instance

export const TEST_CLIENT = {
  id: 'a1111111-1111-4111-8111-111111111111',
  name: 'Test Client',
  email: 'test@example.com',
  phone: '555-0000',
  address: '123 Test St',
  org_id: null,
  created_at: new Date().toISOString(),
};

export const TEST_INVOICE = {
  id: 'b1111111-1111-4111-8111-111111111111',
  invoice_number: 1,
  client_id: TEST_CLIENT.id,
  status: 'draft' as const,
  due_date: '2025-12-31',
  line_items: [
    { description: 'Service', quantity: 2, unit_price: 100, total: 200 },
  ],
  subtotal: 200,
  tax_rate: 0.1,
  tax_amount: 20,
  total: 220,
  notes: 'Test invoice',
  created_by: 'c1111111-1111-4111-8111-111111111111',
  created_at: new Date().toISOString(),
};

export const TEST_PAYMENT = {
  id: 'd1111111-1111-4111-8111-111111111111',
  invoice_id: TEST_INVOICE.id,
  amount: 100,
  method: 'card' as const,
  reference: 'REF-001',
  received_at: new Date().toISOString(),
  created_by: 'c1111111-1111-4111-8111-111111111111',
  created_at: new Date().toISOString(),
};
