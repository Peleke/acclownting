'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { paymentSchema, type PaymentInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface PaymentFormProps {
  invoiceId: string;
  maxAmount: number;
  onSuccess?: () => void;
}

export function PaymentForm({ invoiceId, maxAmount, onSuccess }: PaymentFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw: PaymentInput = {
      invoice_id: invoiceId,
      amount: parseFloat(formData.get('amount') as string),
      method: formData.get('method') as PaymentInput['method'],
      reference: formData.get('reference') as string,
    };

    const result = paymentSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('payments').insert({
      ...result.data,
      created_by: userData.user!.id,
    });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      return;
    }

    if (onSuccess) onSuccess();
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{errors.form}</p>
      )}
      <Input
        id="amount"
        name="amount"
        label={`Amount (max: $${maxAmount.toFixed(2)})`}
        type="number"
        step="0.01"
        max={maxAmount}
        error={errors.amount}
        required
      />
      <Select
        id="method"
        name="method"
        label="Payment Method"
        options={[
          { value: 'cash', label: 'Cash' },
          { value: 'check', label: 'Check' },
          { value: 'card', label: 'Card' },
          { value: 'transfer', label: 'Transfer' },
        ]}
        error={errors.method}
        required
      />
      <Input
        id="reference"
        name="reference"
        label="Reference (optional)"
        error={errors.reference}
      />
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}
