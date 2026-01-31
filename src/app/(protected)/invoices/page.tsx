import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('invoices')
    .select('*, client:clients(name)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: invoices } = await query;

  const statuses = ['draft', 'sent', 'partial', 'paid', 'overdue'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link href="/invoices/new">
          <Button>New Invoice</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <Link href="/invoices">
          <Button variant={!status ? 'primary' : 'ghost'} size="sm">All</Button>
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/invoices?status=${s}`}>
            <Button variant={status === s ? 'primary' : 'ghost'} size="sm" className="capitalize">
              {s}
            </Button>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
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
                <td className="px-4 py-3 text-sm text-gray-600">{(inv.client as { name: string } | null)?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.created_at)}</td>
                <td className="px-4 py-3 text-sm"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(inv.total)}</td>
              </tr>
            ))}
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
