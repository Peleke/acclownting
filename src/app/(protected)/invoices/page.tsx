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
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Invoices</h1>
        <Link href="/invoices/new">
          <Button>New Invoice</Button>
        </Link>
      </div>

      <div className="flex gap-1 mb-5">
        <Link href="/invoices">
          <Button variant={!status ? 'secondary' : 'ghost'} size="sm" className={!status ? 'border-stone-300 bg-white' : ''}>All</Button>
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/invoices?status=${s}`}>
            <Button variant={status === s ? 'secondary' : 'ghost'} size="sm" className={`capitalize ${status === s ? 'border-stone-300 bg-white' : ''}`}>
              {s}
            </Button>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">#</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv, idx) => (
              <tr key={inv.id} className={`hover:bg-stone-50/60 ${idx !== (invoices?.length ?? 0) - 1 ? 'border-b border-stone-100/80' : ''}`}>
                <td className="px-5 py-3.5 text-sm">
                  <Link href={`/invoices/${inv.id}`} className="text-stone-900 font-medium hover:text-accent-600">
                    #{inv.invoice_number}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-stone-500">{(inv.client as { name: string } | null)?.name || '-'}</td>
                <td className="px-5 py-3.5 text-sm text-stone-500">{formatDate(inv.created_at)}</td>
                <td className="px-5 py-3.5 text-sm"><StatusBadge status={inv.status} /></td>
                <td className="px-5 py-3.5 text-sm text-right tabular-nums text-stone-700">{formatCurrency(inv.total)}</td>
              </tr>
            ))}
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-stone-400">
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
