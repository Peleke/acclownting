import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { InvoiceDetailClient } from './invoice-detail-client';
import { MarkAsSentButton, PrintButton, StatusOverride, DeletePaymentButton } from './invoice-actions';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .eq('id', id)
    .single();

  if (!invoice) notFound();

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', id)
    .order('received_at', { ascending: false });

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const balance = invoice.total - totalPaid;

  // FR24: Auto-mark overdue on page load
  const today = new Date().toISOString().split('T')[0];
  if (
    invoice.due_date &&
    invoice.due_date < today &&
    (invoice.status === 'sent' || invoice.status === 'partial')
  ) {
    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('id', invoice.id);
    invoice.status = 'overdue';
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Invoice #{invoice.invoice_number}
            </h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/clients/${invoice.client_id}`} className="hover:text-primary">
              {invoice.client?.name}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === 'draft' && (
            <MarkAsSentButton invoiceId={invoice.id} />
          )}
          <PrintButton invoiceId={invoice.id} />
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary">Edit Invoice</Button>
          </Link>
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary">Download PDF</Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Line Items */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border/50">
              <h2 className="text-sm font-semibold text-foreground">Line Items</h2>
            </div>
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.line_items as Array<{ description: string; quantity: number; unit_price: number; total: number }>).map((item, i) => (
                  <tr key={i} className={i !== (invoice.line_items as Array<unknown>).length - 1 ? 'border-b border-border/20' : ''}>
                    <td className="px-5 py-3 text-sm text-foreground/80">{item.description}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground text-right tabular-nums">{item.quantity}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                    <td className="px-5 py-3 text-sm text-foreground/80 text-right tabular-nums font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-border/50 bg-muted/50">
              <div className="flex flex-col items-end gap-1 text-sm">
                <div className="flex justify-between w-48">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums text-foreground/70">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between w-48">
                  <span className="text-muted-foreground">Tax ({(invoice.tax_rate * 100).toFixed(2)}%)</span>
                  <span className="tabular-nums text-foreground/70">{formatCurrency(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between w-48 pt-2 mt-1 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground tabular-nums">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border/50">
              <h2 className="text-sm font-semibold text-foreground">Payments</h2>
            </div>
            {payments && payments.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reference</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={p.id} className={idx !== payments.length - 1 ? 'border-b border-border/20' : ''}>
                      <td className="px-5 py-3 text-sm text-foreground/80">{formatDate(p.received_at)}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground capitalize">{p.method}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{p.reference || '-'}</td>
                      <td className="px-5 py-3 text-sm text-right tabular-nums text-foreground/80 font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-2 py-3"><DeletePaymentButton paymentId={p.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No payments recorded.</p>
            )}
            <div className="px-5 py-3.5 border-t border-border/50 bg-muted/50 text-right">
              <span className="text-sm font-semibold text-foreground">Balance Due: {formatCurrency(balance)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Notes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {balance > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Record Payment</h2>
              <InvoiceDetailClient invoiceId={invoice.id} maxAmount={balance} />
            </div>
          )}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Details</h2>
            <dl className="space-y-3 text-sm">
              <StatusOverride invoiceId={invoice.id} currentStatus={invoice.status} />
              <div>
                <dt className="text-muted-foreground text-[13px]">Created</dt>
                <dd className="text-foreground/80 font-medium mt-0.5">{formatDate(invoice.created_at)}</dd>
              </div>
              {invoice.due_date && (
                <div>
                  <dt className="text-muted-foreground text-[13px]">Due</dt>
                  <dd className="text-foreground/80 font-medium mt-0.5">{formatDate(invoice.due_date)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
