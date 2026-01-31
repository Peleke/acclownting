export type UserRole = 'admin' | 'staff';
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'check' | 'card' | 'transfer';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Client {
  id: string;
  org_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: number;
  client_id: string;
  status: InvoiceStatus;
  due_date: string | null;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  // Joined fields
  client?: Client;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  received_at: string;
  created_by: string;
  created_at: string;
}

export interface ClientBalance {
  client_id: string;
  client_name: string;
  total_invoiced: number;
  total_paid: number;
  balance: number;
}

export interface RevenueReport {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
}
