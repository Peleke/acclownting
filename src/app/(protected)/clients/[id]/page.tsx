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
    </div>
  );
}
