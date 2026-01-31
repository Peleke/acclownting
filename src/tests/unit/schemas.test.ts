import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  clientSchema,
  invoiceSchema,
  paymentSchema,
  inviteUserSchema,
} from '@/lib/schemas';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123456' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: '123456' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 6');
    }
  });

  it('rejects missing email', () => {
    expect(loginSchema.safeParse({ password: '123456' }).success).toBe(false);
  });

  it('rejects missing password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });

  it('rejects empty object', () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });

  it('trims email edge cases', () => {
    // Zod doesn't trim by default - email with spaces should fail
    expect(loginSchema.safeParse({ email: ' a@b.com ', password: '123456' }).success).toBe(false);
  });
});

describe('clientSchema', () => {
  it('accepts valid client with all fields', () => {
    const result = clientSchema.safeParse({
      name: 'Acme Corp',
      email: 'billing@acme.com',
      phone: '555-0100',
      address: '123 Main St',
    });
    expect(result.success).toBe(true);
  });

  it('accepts client with only name', () => {
    expect(clientSchema.safeParse({ name: 'Acme' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(clientSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('accepts empty string for optional email', () => {
    expect(clientSchema.safeParse({ name: 'X', email: '' }).success).toBe(true);
  });

  it('rejects invalid email format', () => {
    expect(clientSchema.safeParse({ name: 'X', email: 'notanemail' }).success).toBe(false);
  });

  it('accepts valid email', () => {
    expect(clientSchema.safeParse({ name: 'X', email: 'valid@email.com' }).success).toBe(true);
  });

  it('accepts empty string for optional phone', () => {
    expect(clientSchema.safeParse({ name: 'X', phone: '' }).success).toBe(true);
  });

  it('accepts empty string for optional address', () => {
    expect(clientSchema.safeParse({ name: 'X', address: '' }).success).toBe(true);
  });
});

describe('invoiceSchema', () => {
  const validLineItem = { description: 'Work', quantity: 1, unit_price: 100, total: 100 };
  const validInvoice = {
    client_id: '123e4567-e89b-42d3-a456-426614174000',
    line_items: [validLineItem],
    subtotal: 100,
    tax_rate: 0.1,
    tax_amount: 10,
    total: 110,
  };

  it('accepts valid invoice', () => {
    expect(invoiceSchema.safeParse(validInvoice).success).toBe(true);
  });

  it('accepts invoice with optional fields', () => {
    expect(invoiceSchema.safeParse({
      ...validInvoice,
      due_date: '2025-12-31',
      notes: 'Net 30',
    }).success).toBe(true);
  });

  it('accepts empty due_date', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, due_date: '' }).success).toBe(true);
  });

  it('accepts empty notes', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, notes: '' }).success).toBe(true);
  });

  it('rejects empty line items array', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, line_items: [] }).success).toBe(false);
  });

  it('rejects invalid client_id', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, client_id: 'bad' }).success).toBe(false);
  });

  it('rejects line item with empty description', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      line_items: [{ ...validLineItem, description: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects line item with zero quantity', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      line_items: [{ ...validLineItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects line item with negative quantity', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      line_items: [{ ...validLineItem, quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects line item with negative unit_price', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      line_items: [{ ...validLineItem, unit_price: -5 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero unit_price', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      line_items: [{ ...validLineItem, unit_price: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects tax_rate above 1', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, tax_rate: 1.5 }).success).toBe(false);
  });

  it('rejects negative tax_rate', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, tax_rate: -0.1 }).success).toBe(false);
  });

  it('accepts zero tax_rate', () => {
    expect(invoiceSchema.safeParse({ ...validInvoice, tax_rate: 0 }).success).toBe(true);
  });

  it('accepts multiple line items', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      line_items: [validLineItem, { description: 'More', quantity: 2, unit_price: 50, total: 100 }],
    });
    expect(result.success).toBe(true);
  });
});

describe('paymentSchema', () => {
  const validPayment = {
    invoice_id: '123e4567-e89b-42d3-a456-426614174000',
    amount: 50,
    method: 'card' as const,
  };

  it('accepts valid payment', () => {
    expect(paymentSchema.safeParse(validPayment).success).toBe(true);
  });

  it('accepts all payment methods', () => {
    for (const method of ['cash', 'check', 'card', 'transfer'] as const) {
      expect(paymentSchema.safeParse({ ...validPayment, method }).success).toBe(true);
    }
  });

  it('rejects invalid method', () => {
    expect(paymentSchema.safeParse({ ...validPayment, method: 'bitcoin' }).success).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(paymentSchema.safeParse({ ...validPayment, amount: 0 }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(paymentSchema.safeParse({ ...validPayment, amount: -10 }).success).toBe(false);
  });

  it('accepts optional reference', () => {
    expect(paymentSchema.safeParse({ ...validPayment, reference: 'CHG-123' }).success).toBe(true);
  });

  it('accepts empty reference', () => {
    expect(paymentSchema.safeParse({ ...validPayment, reference: '' }).success).toBe(true);
  });

  it('accepts optional received_at', () => {
    expect(paymentSchema.safeParse({ ...validPayment, received_at: '2025-06-15' }).success).toBe(true);
  });

  it('rejects invalid invoice_id', () => {
    expect(paymentSchema.safeParse({ ...validPayment, invoice_id: 'not-uuid' }).success).toBe(false);
  });

  it('accepts fractional amounts', () => {
    expect(paymentSchema.safeParse({ ...validPayment, amount: 99.99 }).success).toBe(true);
  });
});

describe('inviteUserSchema', () => {
  const validInvite = { email: 'new@staff.com', full_name: 'New Staff', role: 'staff' as const };

  it('accepts valid invite', () => {
    expect(inviteUserSchema.safeParse(validInvite).success).toBe(true);
  });

  it('accepts admin role', () => {
    expect(inviteUserSchema.safeParse({ ...validInvite, role: 'admin' }).success).toBe(true);
  });

  it('rejects invalid role', () => {
    expect(inviteUserSchema.safeParse({ ...validInvite, role: 'superadmin' }).success).toBe(false);
  });

  it('rejects empty full_name', () => {
    expect(inviteUserSchema.safeParse({ ...validInvite, full_name: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(inviteUserSchema.safeParse({ ...validInvite, email: 'bad' }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(inviteUserSchema.safeParse({}).success).toBe(false);
    expect(inviteUserSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
    expect(inviteUserSchema.safeParse({ email: 'a@b.com', full_name: 'X' }).success).toBe(false);
  });
});
