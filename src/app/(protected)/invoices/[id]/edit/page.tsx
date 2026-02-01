import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { InvoiceForm } from '@/components/invoice-form';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (!invoice) notFound();

  const { data: clients } = await supabase.from('clients').select('*').order('name');

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground tracking-tight mb-6">Edit Invoice #{invoice.invoice_number}</h1>
      <div className="bg-card rounded-xl border border-border shadow-card p-6 sm:p-8">
        <InvoiceForm
          clients={clients || []}
          invoice={{
            id: invoice.id,
            client_id: invoice.client_id,
            due_date: invoice.due_date,
            line_items: invoice.line_items,
            tax_rate: invoice.tax_rate,
            notes: invoice.notes,
          }}
        />
      </div>
    </div>
  );
}
