'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function MarkAsSentButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMarkAsSent() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
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
    // Small delay to let the PDF load, then trigger print
    setTimeout(() => {
      // The user can print from the PDF viewer tab
    }, 500);
  }

  return (
    <Button variant="outline" onClick={handlePrint}>
      Print
    </Button>
  );
}
