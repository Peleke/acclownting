import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClientDetailClient } from './client-detail-client';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (!client) notFound();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-600">
            {[client.email, client.phone].filter(Boolean).join(' | ') || 'No contact info'}
          </p>
          {client.address && <p className="text-gray-600">{client.address}</p>}
        </div>
        <ClientDetailClient client={client} />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h2>
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <Link href={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                    #{inv.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.created_at)}</td>
                <td className="px-4 py-3 text-sm"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(inv.total)}</td>
              </tr>
            ))}
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No invoices for this client yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
