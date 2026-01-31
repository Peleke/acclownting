import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { InvoiceDetailClient } from './invoice-detail-client';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice #{invoice.invoice_number}
          </h1>
          <p className="text-gray-600">
            <Link href={`/clients/${invoice.client_id}`} className="text-blue-600 hover:underline">
              {invoice.client?.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={invoice.status} />
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary">Download PDF</Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-900">Line Items</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(invoice.line_items as Array<{ description: string; quantity: number; unit_price: number; total: number }>).map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t space-y-1 text-right text-sm">
              <div>Subtotal: {formatCurrency(invoice.subtotal)}</div>
              <div>Tax ({(invoice.tax_rate * 100).toFixed(2)}%): {formatCurrency(invoice.tax_amount)}</div>
              <div className="text-lg font-bold">Total: {formatCurrency(invoice.total)}</div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-900">Payments</h2>
            </div>
            {payments && payments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-sm">{formatDate(p.received_at)}</td>
                      <td className="px-4 py-2 text-sm capitalize">{p.method}</td>
                      <td className="px-4 py-2 text-sm">{p.reference || '-'}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-4 py-8 text-center text-gray-500">No payments recorded.</p>
            )}
            <div className="px-4 py-3 border-t text-right text-sm">
              <span className="font-semibold">Balance Due: {formatCurrency(balance)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-white rounded-lg shadow border p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div>
          {balance > 0 && (
            <div className="bg-white rounded-lg shadow border p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Record Payment</h2>
              <InvoiceDetailClient invoiceId={invoice.id} maxAmount={balance} />
            </div>
          )}
          <div className="mt-4 bg-white rounded-lg shadow border p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Details</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Created</dt><dd>{formatDate(invoice.created_at)}</dd></div>
              {invoice.due_date && <div><dt className="text-gray-500">Due</dt><dd>{formatDate(invoice.due_date)}</dd></div>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
