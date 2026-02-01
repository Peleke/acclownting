'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function MarkAsSentButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMarkAsSent() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceId);

    if (error) {
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <Button onClick={handleMarkAsSent} disabled={loading}>
      {loading ? 'Updating...' : 'Mark as Sent'}
    </Button>
  );
}

export function PrintButton({ invoiceId }: { invoiceId: string }) {
  function handlePrint() {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  }

  return (
    <Button variant="ghost" onClick={handlePrint}>
      Print
    </Button>
  );
}

export function StatusOverride({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const statuses = ['draft', 'sent', 'partial', 'paid', 'overdue'];

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    if (!confirm(`Change status from "${currentStatus}" to "${newStatus}"?`)) {
      e.target.value = currentStatus;
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <dt className="text-muted-foreground text-[13px]">Status</dt>
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className="mt-0.5 w-full rounded-lg border border-input bg-card px-2 py-1 text-sm text-foreground capitalize focus:outline-none focus:ring-2 focus:ring-ring/20"
        aria-label="Change status"
      >
        {statuses.map((s) => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </select>
    </div>
  );
}

export function DeletePaymentButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this payment? This will update the invoice balance.')) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('payments').delete().eq('id', paymentId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
      title="Delete payment"
      aria-label="Delete payment"
    >
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M1 1l12 12M13 1L1 13" />
      </svg>
    </button>
  );
}
