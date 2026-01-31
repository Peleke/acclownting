import { createServerSupabaseClient } from '@/lib/supabase/server';
import { InvoiceForm } from '@/components/invoice-form';

export default async function NewInvoicePage() {
  const supabase = await createServerSupabaseClient();
  const { data: clients } = await supabase.from('clients').select('*').order('name');

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 tracking-tight mb-6">New Invoice</h1>
      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card p-6 sm:p-8">
        <InvoiceForm clients={clients || []} />
      </div>
    </div>
  );
}
