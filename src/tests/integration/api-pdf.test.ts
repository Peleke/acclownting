import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetUser = vi.fn();
const mockInvoiceQuery = vi.fn();
const mockPaymentsQuery = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => {
      if (table === 'invoices') {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockInvoiceQuery(),
            }),
          }),
        };
      }
      if (table === 'payments') {
        return {
          select: () => ({
            eq: () => ({
              order: () => mockPaymentsQuery(),
            }),
          }),
        };
      }
      return {};
    },
  }),
}));

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}));

const { GET } = await import('@/app/api/invoices/[id]/pdf/route');

describe('GET /api/invoices/[id]/pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeRequest = () => new NextRequest('http://localhost/api/invoices/inv-1/pdf');
  const makeParams = () => Promise.resolve({ id: 'inv-1' });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(makeRequest(), { params: makeParams() });
    expect(res.status).toBe(401);
  });

  it('returns 404 when invoice not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockInvoiceQuery.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const res = await GET(makeRequest(), { params: makeParams() });
    expect(res.status).toBe(404);
  });

  it('returns PDF with correct headers', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockInvoiceQuery.mockResolvedValue({
      data: {
        id: 'inv-1',
        invoice_number: 1001,
        client_id: 'c-1',
        status: 'sent',
        line_items: [{ description: 'Work', quantity: 1, unit_price: 100, total: 100 }],
        subtotal: 100,
        tax_rate: 0.1,
        tax_amount: 10,
        total: 110,
        created_at: '2025-01-01',
        client: { name: 'Acme', email: 'a@b.com' },
      },
      error: null,
    });
    mockPaymentsQuery.mockResolvedValue({ data: [], error: null });

    const res = await GET(makeRequest(), { params: makeParams() });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('invoice-1001.pdf');
  });

  it('includes payments in PDF data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockInvoiceQuery.mockResolvedValue({
      data: {
        id: 'inv-1',
        invoice_number: 1001,
        status: 'partial',
        line_items: [],
        subtotal: 100,
        tax_rate: 0,
        tax_amount: 0,
        total: 100,
        created_at: '2025-01-01',
        client: { name: 'Acme' },
      },
      error: null,
    });
    mockPaymentsQuery.mockResolvedValue({
      data: [
        { id: 'p-1', amount: 50, method: 'card', reference: 'CHG-1', received_at: '2025-01-15' },
      ],
      error: null,
    });

    const res = await GET(makeRequest(), { params: makeParams() });
    expect(res.status).toBe(200);
  });
});
