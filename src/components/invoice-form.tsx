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
}

const emptyLineItem: LineItem = { description: '', quantity: 1, unit_price: 0, total: 0 };

export function InvoiceForm({ clients }: InvoiceFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.form}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="client_id"
          name="client_id"
          label="Client"
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
        <h3 className="text-sm font-medium text-gray-700 mb-2">Line Items</h3>
        <div className="space-y-2">
          {lineItems.map((item, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Input
                label={i === 0 ? 'Description' : undefined}
                value={item.description}
                onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                className="flex-1"
                required
              />
              <Input
                label={i === 0 ? 'Qty' : undefined}
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                className="w-20"
                required
              />
              <Input
                label={i === 0 ? 'Price' : undefined}
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateLineItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                className="w-28"
                required
              />
              <div className={`w-24 text-right text-sm ${i === 0 ? 'pt-6' : ''}`}>
                {formatCurrency(item.total)}
              </div>
              <button
                type="button"
                onClick={() => removeLineItem(i)}
                className={`text-red-500 hover:text-red-700 text-lg px-2 ${i === 0 ? 'pt-6' : ''}`}
                disabled={lineItems.length === 1}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={addLineItem} className="mt-2">
          + Add Line Item
        </Button>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Tax Rate (%):</span>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <div className="text-sm text-gray-600">Subtotal: {formatCurrency(totals.subtotal)}</div>
        <div className="text-sm text-gray-600">Tax: {formatCurrency(totals.taxAmount)}</div>
        <div className="text-lg font-semibold">Total: {formatCurrency(totals.total)}</div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
