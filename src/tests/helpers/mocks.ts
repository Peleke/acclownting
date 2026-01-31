import { vi } from 'vitest';
import type { Client, Invoice, Payment, Profile } from '@/lib/types';

// Valid RFC4122 UUIDs (version 4, variant 1)
export const UUID_CLIENT_1 = 'a1111111-1111-4111-8111-111111111111';
export const UUID_CLIENT_2 = 'a2222222-2222-4222-8222-222222222222';
export const UUID_INVOICE_1 = 'b1111111-1111-4111-8111-111111111111';
export const UUID_INVOICE_2 = 'b2222222-2222-4222-8222-222222222222';
export const UUID_PAYMENT_1 = 'd1111111-1111-4111-8111-111111111111';
export const UUID_PAYMENT_2 = 'd2222222-2222-4222-8222-222222222222';
export const UUID_USER_1 = 'c1111111-1111-4111-8111-111111111111';

export function createMockSupabaseClient(overrides: Record<string, unknown> = {}) {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  });

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: UUID_USER_1, email: 'test@test.com' } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    ...overrides,
  };
}

export const MOCK_PROFILE: Profile = {
  id: UUID_USER_1,
  full_name: 'Test User',
  role: 'admin',
  created_at: '2025-01-01T00:00:00Z',
};

export const MOCK_CLIENT: Client = {
  id: UUID_CLIENT_1,
  org_id: null,
  name: 'Acme Corp',
  email: 'billing@acme.com',
  phone: '555-0100',
  address: '123 Main St',
  created_at: '2025-01-01T00:00:00Z',
};

export const MOCK_CLIENT_2: Client = {
  id: UUID_CLIENT_2,
  org_id: null,
  name: 'Globex Inc',
  email: 'ap@globex.com',
  phone: '555-0200',
  address: '456 Oak Ave',
  created_at: '2025-01-02T00:00:00Z',
};

export const MOCK_INVOICE: Invoice = {
  id: UUID_INVOICE_1,
  invoice_number: 1001,
  client_id: UUID_CLIENT_1,
  status: 'sent',
  due_date: '2025-12-31',
  line_items: [
    { description: 'Web Development', quantity: 10, unit_price: 150, total: 1500 },
    { description: 'Design Work', quantity: 5, unit_price: 120, total: 600 },
  ],
  subtotal: 2100,
  tax_rate: 0.08,
  tax_amount: 168,
  total: 2268,
  notes: 'Net 30',
  created_by: UUID_USER_1,
  created_at: '2025-06-01T00:00:00Z',
  client: MOCK_CLIENT,
};

export const MOCK_INVOICE_DRAFT: Invoice = {
  id: UUID_INVOICE_2,
  invoice_number: 1002,
  client_id: UUID_CLIENT_2,
  status: 'draft',
  due_date: null,
  line_items: [
    { description: 'Consulting', quantity: 8, unit_price: 200, total: 1600 },
  ],
  subtotal: 1600,
  tax_rate: 0,
  tax_amount: 0,
  total: 1600,
  notes: null,
  created_by: UUID_USER_1,
  created_at: '2025-07-01T00:00:00Z',
};

export const MOCK_PAYMENT: Payment = {
  id: UUID_PAYMENT_1,
  invoice_id: UUID_INVOICE_1,
  amount: 1000,
  method: 'card',
  reference: 'CHG-4242',
  received_at: '2025-06-15T00:00:00Z',
  created_by: UUID_USER_1,
  created_at: '2025-06-15T00:00:00Z',
};

export const MOCK_PAYMENT_2: Payment = {
  id: UUID_PAYMENT_2,
  invoice_id: UUID_INVOICE_1,
  amount: 1268,
  method: 'transfer',
  reference: 'WIR-9876',
  received_at: '2025-07-01T00:00:00Z',
  created_by: UUID_USER_1,
  created_at: '2025-07-01T00:00:00Z',
};
