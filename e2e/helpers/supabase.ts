import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

/**
 * Creates a Supabase admin client using the service role key.
 * This bypasses RLS and is used for test data setup/teardown.
 */
export function createTestAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for test helpers'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Test Data Helpers ───────────────────────────────────────────────────────

export interface TestClient {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface TestInvoice {
  id?: string;
  client_id: string;
  status?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  notes?: string;
  created_by: string;
  due_date?: string;
}

export interface TestPayment {
  id?: string;
  invoice_id: string;
  amount: number;
  method: 'cash' | 'check' | 'card' | 'transfer';
  reference?: string;
  created_by: string;
}

/**
 * Create a test client directly via the admin client (bypasses RLS).
 */
export async function createTestClient(
  admin: SupabaseClient,
  data: TestClient
): Promise<{ id: string; name: string }> {
  const { data: client, error } = await admin
    .from('clients')
    .insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create test client: ${error.message}`);
  return client;
}

/**
 * Create a test invoice directly via the admin client.
 */
export async function createTestInvoice(
  admin: SupabaseClient,
  data: TestInvoice
): Promise<{ id: string; invoice_number: number; total: number }> {
  const { data: invoice, error } = await admin
    .from('invoices')
    .insert({
      client_id: data.client_id,
      status: data.status || 'draft',
      line_items: data.line_items,
      subtotal: data.subtotal,
      tax_rate: data.tax_rate || 0,
      tax_amount: data.tax_amount || 0,
      total: data.total,
      notes: data.notes || null,
      created_by: data.created_by,
      due_date: data.due_date || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create test invoice: ${error.message}`);
  return invoice;
}

/**
 * Create a test payment directly via the admin client.
 */
export async function createTestPayment(
  admin: SupabaseClient,
  data: TestPayment
): Promise<{ id: string; amount: number }> {
  const { data: payment, error } = await admin
    .from('payments')
    .insert({
      invoice_id: data.invoice_id,
      amount: data.amount,
      method: data.method,
      reference: data.reference || null,
      created_by: data.created_by,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create test payment: ${error.message}`);
  return payment;
}

/**
 * Get the test user's profile ID. Needed for created_by fields.
 */
export async function getTestUserId(admin: SupabaseClient, email: string): Promise<string> {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw new Error(`Failed to list users: ${error.message}`);

  const user = data.users.find((u) => u.email === email);
  if (!user) throw new Error(`Test user with email ${email} not found`);
  return user.id;
}

// ─── Cleanup Helpers ─────────────────────────────────────────────────────────

/**
 * Delete a payment by ID.
 */
export async function deletePayment(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin.from('payments').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete payment ${id}: ${error.message}`);
}

/**
 * Delete an invoice by ID. Also deletes associated payments.
 */
export async function deleteInvoice(admin: SupabaseClient, id: string): Promise<void> {
  // Delete payments first (FK constraint)
  await admin.from('payments').delete().eq('invoice_id', id);
  const { error } = await admin.from('invoices').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete invoice ${id}: ${error.message}`);
}

/**
 * Delete a client by ID. Also deletes associated invoices and payments.
 */
export async function deleteClient(admin: SupabaseClient, id: string): Promise<void> {
  // Get all invoices for this client
  const { data: invoices } = await admin.from('invoices').select('id').eq('client_id', id);
  if (invoices) {
    for (const inv of invoices) {
      await deleteInvoice(admin, inv.id);
    }
  }
  const { error } = await admin.from('clients').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete client ${id}: ${error.message}`);
}

/**
 * Cleanup all test data created with a specific name prefix.
 * Useful for bulk cleanup after test suites.
 */
export async function cleanupTestClients(
  admin: SupabaseClient,
  namePrefix: string
): Promise<void> {
  const { data: clients } = await admin
    .from('clients')
    .select('id')
    .like('name', `${namePrefix}%`);

  if (clients) {
    for (const client of clients) {
      await deleteClient(admin, client.id);
    }
  }
}
