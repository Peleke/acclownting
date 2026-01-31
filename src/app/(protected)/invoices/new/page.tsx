import { createServerSupabaseClient } from '@/lib/supabase/server';
import { InvoiceForm } from '@/components/invoice-form';

export default async function NewInvoicePage() {
  const supabase = await createServerSupabaseClient();
  const { data: clients } = await supabase.from('clients').select('*').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Invoice</h1>
      <div className="bg-white rounded-lg shadow border p-6">
        <InvoiceForm clients={clients || []} />
      </div>
    </div>
  );
}
