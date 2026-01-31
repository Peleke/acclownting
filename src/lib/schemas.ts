import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Price must be non-negative'),
  total: z.number(),
});

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Select a client'),
  due_date: z.string().optional().or(z.literal('')),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  subtotal: z.number(),
  tax_rate: z.number().min(0).max(1),
  tax_amount: z.number(),
  total: z.number(),
  notes: z.string().optional().or(z.literal('')),
});

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['cash', 'check', 'card', 'transfer']),
  reference: z.string().optional().or(z.literal('')),
  received_at: z.string().optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'staff']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
