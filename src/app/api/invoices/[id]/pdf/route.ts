import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { InvoicePDF } from '@/components/invoice-pdf';
import React from 'react';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .eq('id', id)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', id)
    .order('received_at');

  const pdfElement = React.createElement(InvoicePDF, {
    invoice,
    payments: payments || [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
  const buffer = await renderToBuffer(pdfElement);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.pdf"`,
    },
  });
}
