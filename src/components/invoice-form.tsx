'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { invoiceSchema } from '@/lib/schemas';
import { calculateInvoiceTotals, calculateLineItemTotal, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Client, LineItem } from '@/lib/types';

interface InvoiceFormProps {
  clients: Client[];
  defaultClientId?: string;
}

const emptyLineItem: LineItem = { description: '', quantity: 1, unit_price: 0, total: 0 };

export function InvoiceForm({ clients, defaultClientId }: InvoiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...emptyLineItem }]);
  const [taxRate, setTaxRate] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const totals = calculateInvoiceTotals(lineItems, taxRate / 100);

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => {
      const items = [...prev];
      const item = { ...items[index], [field]: value };
      item.total = calculateLineItemTotal(item.quantity, item.unit_price);
      items[index] = item;
      return items;
    });
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { ...emptyLineItem }]);
  }

  function removeLineItem(index: number) {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const effectiveTaxRate = taxRate / 100;
    const computedTotals = calculateInvoiceTotals(lineItems, effectiveTaxRate);

    const raw = {
      client_id: formData.get('client_id') as string,
      due_date: formData.get('due_date') as string,
      line_items: lineItems,
      subtotal: computedTotals.subtotal,
      tax_rate: effectiveTaxRate,
      tax_amount: computedTotals.taxAmount,
      total: computedTotals.total,
      notes: formData.get('notes') as string,
    };

    const result = invoiceSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join('.')] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('invoices').insert({
      ...result.data,
      created_by: userData.user!.id,
    });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      return;
    }

    router.push('/invoices');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.form && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="client_id"
          name="client_id"
          label="Client"
          defaultValue={defaultClientId}
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          error={errors.client_id}
          required
        />
        <Input
          id="due_date"
          name="due_date"
          label="Due Date"
          type="date"
          error={errors.due_date}
        />
      </div>

      <div>
        <h3 className="text-[13px] font-medium text-muted-foreground mb-3">Line Items</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_5rem_7rem_6rem_2.5rem] gap-0 bg-muted border-b border-border/50 px-3 py-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Qty</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Price</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Total</span>
            <span></span>
          </div>
          {/* Rows */}
          {lineItems.map((item, i) => (
            <div key={i} className={`grid grid-cols-[1fr_5rem_7rem_6rem_2.5rem] gap-0 items-center px-3 py-2 ${i !== lineItems.length - 1 ? 'border-b border-border/30' : ''}`}>
              <input
                value={item.description}
                onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none w-full pr-2"
                placeholder="Item description"
                required
              />
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                className="bg-transparent text-sm text-foreground/80 text-right tabular-nums focus:outline-none w-full"
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateLineItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                className="bg-transparent text-sm text-foreground/80 text-right tabular-nums focus:outline-none w-full"
                required
              />
              <div className="text-sm text-foreground/80 text-right tabular-nums font-medium">
                {formatCurrency(item.total)}
              </div>
              <button
                type="button"
                onClick={() => removeLineItem(i)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 ml-auto"
                disabled={lineItems.length === 1}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLineItem}
          className="mt-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          + Add line item
        </button>
      </div>

      <div className="flex flex-col items-end gap-2 p-4 bg-muted rounded-xl border border-border/50">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[13px] text-muted-foreground">Tax Rate (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            className="w-20 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
          />
        </div>
        <div className="flex justify-between w-48 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums text-foreground/70">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between w-48 text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="tabular-nums text-foreground/70">{formatCurrency(totals.taxAmount)}</span>
        </div>
        <div className="flex justify-between w-48 pt-2 mt-1 border-t border-border">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-[13px] font-medium text-muted-foreground mb-1.5">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="block w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-soft hover:border-input/80 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-shadow resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
