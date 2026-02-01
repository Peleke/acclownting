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

  // FR22: Fetch all payments for this client's invoices
  const invoiceIds = invoices?.map((inv) => inv.id) || [];
  const { data: payments } = invoiceIds.length > 0
    ? await supabase
        .from('payments')
        .select('*, invoice:invoices(invoice_number)')
        .in('invoice_id', invoiceIds)
        .order('received_at', { ascending: false })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{client.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {[client.email, client.phone].filter(Boolean).join(' \u00b7 ') || 'No contact info'}
          </p>
          {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
        </div>
        <ClientDetailClient client={client} />
      </div>

      <h2 className="text-sm font-semibold text-foreground mb-3">Invoices</h2>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">#</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv, idx) => (
              <tr key={inv.id} className={`hover:bg-muted/50 ${idx !== (invoices?.length ?? 0) - 1 ? 'border-b border-border/30' : ''}`}>
                <td className="px-5 py-3.5 text-sm">
                  <Link href={`/invoices/${inv.id}`} className="text-foreground font-medium hover:text-primary">
                    #{inv.invoice_number}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(inv.created_at)}</td>
                <td className="px-5 py-3.5 text-sm"><StatusBadge status={inv.status} /></td>
                <td className="px-5 py-3.5 text-sm text-right tabular-nums text-foreground/80">{formatCurrency(inv.total)}</td>
              </tr>
            ))}
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No invoices for this client yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-semibold text-foreground mb-3 mt-8">Payment History</h2>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((p: { id: string; invoice_id: string; received_at: string; method: string; amount: number; invoice: { invoice_number: number } | null }, idx: number) => (
              <tr key={p.id} className={`hover:bg-muted/50 ${idx !== (payments?.length ?? 0) - 1 ? 'border-b border-border/30' : ''}`}>
                <td className="px-5 py-3.5 text-sm">
                  <Link href={`/invoices/${p.invoice_id}`} className="text-foreground font-medium hover:text-primary">
                    #{p.invoice?.invoice_number}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(p.received_at)}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground capitalize">{p.method}</td>
                <td className="px-5 py-3.5 text-sm text-right tabular-nums text-foreground/80 font-medium">{formatCurrency(p.amount)}</td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No payments recorded for this client.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
